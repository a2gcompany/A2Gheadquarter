#!/usr/bin/env node
/**
 * A2G HQ - Bank Data Import Script
 * Imports consolidated Excel bank data into Supabase
 * 
 * Allocation rules:
 * - Wio Business AED: Meta/Klaviyo/Shopify/GoDaddy/Marius/Cristian/Salva → AUDESIGN
 *                      VirtusTax → A2G Company
 *                      Rest → A2G Company (holding management)
 * - Wio Personal AED/EUR/USD + Wise USD + Amex Platinum → Aitzol Personal
 */

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');

// --- Config ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hgxdozjewidhthlfsnhp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXCEL_PATH = '/Users/a2g/Downloads/A2G_Extractos_Consolidados_2025 (1).xlsx';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// --- Known IDs ---
const PROJECT_IDS = {
  'A2G Company': '91e1287e-8e21-4e71-afaa-685566b6dc1e',
  'A2G Talents': '7bd98550-c854-443b-9fcf-9737159ab239',
  'Audesign': 'e232f7c0-3a86-4086-9567-8114d046c3ec',
  'BABEL': '0bf0ed0e-efe4-4d80-be45-2a5e9235ccdc',
  'Prophecy': '9a087a68-e1f9-456d-9c88-ddb1071956be',
  'Roger Sanchez': '8ab009ed-c3e0-4ab5-95f4-b26b81d4f6a2',
  'AIRE': '901ec86f-ba2a-41cd-afda-f813690dd555',
};

const PAYMENT_SOURCE_IDS = {
  'Wio Business': '33d7bf3b-a919-42b5-9b1a-f79dd34c8fb5',
  'Wio Personal': '179bf54d-cd67-4871-b237-a62b665521e6',
  'Amex Personal': '43761bb3-a57a-44de-a047-a4ed6ea5b552',
  'Wise Personal': '01258789-27ff-4309-b716-9cb133a7063c',
};

const BU_IDS = {
  'holding': 'a79848a6-a8d9-4e31-9b5b-53bfa271b0b7',
  'talents': '961b43b9-a2c3-4366-9791-f4d9364efaec',
  'audesign': '597300f6-5612-4ab7-979e-9a84b4e76137',
};

// --- Audesign keywords for Wio Business AED classification ---
const AUDESIGN_KEYWORDS = [
  'meta', 'facebook', 'fb ', 'klaviyo', 'shopify', 'godaddy', 'go daddy',
  'marius', 'cristian', 'salva', 'google ads', 'google cloud',
  'paypal', 'mailchimp', 'notion', 'figma', 'vercel', 'netlify',
  'heroku', 'aws', 'stripe', 'canva', 'adobe', 'envato',
  'openai', 'anthropic', 'github', 'gitlab',
];

const A2G_COMPANY_KEYWORDS = [
  'virtustax', 'virtus tax', 'virtus', 'government', 'license', 'trade license',
  'visa', 'emirates id', 'eid', 'ministry', 'immigration',
];

// --- Helpers ---
function parseAmount(raw) {
  if (!raw) return 0;
  const str = String(raw);
  // Remove currency symbols and whitespace
  const cleaned = str.replace(/[€$£\s]/g, '')
    .replace(/AED/gi, '')
    .replace(/USD/gi, '')
    .replace(/EUR/gi, '')
    .trim();
  
  // Handle EU format: 1.234,56 → 1234.56
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Check which is the decimal separator
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) {
      // EU format: dots are thousands, comma is decimal
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      // US format: commas are thousands, dot is decimal
      return parseFloat(cleaned.replace(/,/g, '')) || 0;
    }
  }
  
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Could be EU decimal or US thousands
    const parts = cleaned.split(',');
    if (parts[parts.length - 1].length <= 2) {
      return parseFloat(cleaned.replace(',', '.')) || 0;
    }
    return parseFloat(cleaned.replace(/,/g, '')) || 0;
  }
  
  return parseFloat(cleaned.replace(/,/g, '')) || 0;
}

function normalizeDate(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  
  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.substring(0, 10);
  
  // DD/MM/YYYY
  const euMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (euMatch) {
    const [, d, m, y] = euMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  // Excel serial number
  if (/^\d{5}$/.test(trimmed)) {
    const excelDate = new Date((parseInt(trimmed) - 25569) * 86400 * 1000);
    return excelDate.toISOString().substring(0, 10);
  }
  
  // JS Date parse
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  
  return null;
}

function classifyWioBusiness(description) {
  const desc = (description || '').toLowerCase();
  
  // Check Audesign keywords
  for (const kw of AUDESIGN_KEYWORDS) {
    if (desc.includes(kw)) return 'Audesign';
  }
  
  // Check A2G Company keywords
  for (const kw of A2G_COMPANY_KEYWORDS) {
    if (desc.includes(kw)) return 'A2G Company';
  }
  
  // Some specific patterns
  if (desc.includes('ftmo') || desc.includes('trad')) return 'A2G Company'; // Trading
  if (desc.includes('salary') || desc.includes('transfer to')) return 'A2G Company';
  if (desc.includes('wio') && desc.includes('fee')) return 'A2G Company'; // Bank fees
  
  // Default: A2G Company (holding/general management)
  return 'A2G Company';
}

function guessCurrency(sheetName) {
  if (sheetName.includes('AED')) return 'AED';
  if (sheetName.includes('EUR')) return 'EUR';
  if (sheetName.includes('USD')) return 'USD';
  return 'EUR';
}

// --- Main ---
async function main() {
  console.log('=== A2G HQ Bank Data Import ===\n');
  
  // Step 1: Create "Aitzol Personal" project if it doesn't exist
  console.log('1. Checking/creating Personal project...');
  let personalProjectId;
  const { data: existingPersonal } = await sb.from('projects')
    .select('id')
    .eq('name', 'Aitzol Personal')
    .maybeSingle();
  
  if (existingPersonal) {
    personalProjectId = existingPersonal.id;
    console.log('   ✓ Aitzol Personal already exists:', personalProjectId);
  } else {
    const { data: newProject, error: createErr } = await sb.from('projects')
      .insert({
        name: 'Aitzol Personal',
        type: 'vertical',
        business_unit_id: BU_IDS.holding,
      })
      .select()
      .single();
    
    if (createErr) {
      console.error('   ✗ Error creating project:', createErr.message);
      process.exit(1);
    }
    personalProjectId = newProject.id;
    console.log('   ✓ Created Aitzol Personal:', personalProjectId);
  }
  PROJECT_IDS['Aitzol Personal'] = personalProjectId;
  
  // Step 2: Create missing payment sources
  console.log('\n2. Checking/creating payment sources...');
  const missingSourcesSpec = [
    { name: 'Wio Personal EUR', type: 'bank', currency: 'EUR', bu: 'holding' },
    { name: 'Wio Personal USD', type: 'bank', currency: 'USD', bu: 'holding' },
    { name: 'Wise USD', type: 'wise', currency: 'USD', bu: 'holding' },
  ];
  
  for (const spec of missingSourcesSpec) {
    const { data: existing } = await sb.from('payment_sources')
      .select('id')
      .eq('name', spec.name)
      .maybeSingle();
    
    if (existing) {
      PAYMENT_SOURCE_IDS[spec.name] = existing.id;
      console.log(`   ✓ ${spec.name} already exists:`, existing.id);
    } else {
      const { data: created, error } = await sb.from('payment_sources')
        .insert({
          name: spec.name,
          type: spec.type,
          currency: spec.currency,
          business_unit_id: BU_IDS[spec.bu],
          is_active: true,
        })
        .select()
        .single();
      
      if (error) {
        console.error(`   ✗ Error creating ${spec.name}:`, error.message);
      } else {
        PAYMENT_SOURCE_IDS[spec.name] = created.id;
        console.log(`   ✓ Created ${spec.name}:`, created.id);
      }
    }
  }
  
  // Step 3: Read Excel
  console.log('\n3. Reading Excel file...');
  const wb = XLSX.readFile(EXCEL_PATH);
  console.log('   Sheets:', wb.SheetNames.join(', '));
  
  // Step 4: Process each sheet
  const sheetsToProcess = [
    { name: 'Wio Personal AED', paymentSource: 'Wio Personal', project: 'Aitzol Personal' },
    { name: 'Wio Personal EUR', paymentSource: 'Wio Personal EUR', project: 'Aitzol Personal' },
    { name: 'Wio Personal USD', paymentSource: 'Wio Personal USD', project: 'Aitzol Personal' },
    { name: 'Wio Business AED', paymentSource: 'Wio Business', project: null }, // Dynamic allocation
    { name: 'Wise USD', paymentSource: 'Wise USD', project: 'Aitzol Personal' },
    { name: 'Amex Platinum EUR', paymentSource: 'Amex Personal', project: 'Aitzol Personal' },
  ];
  
  const allTransactions = [];
  const stats = {};
  
  for (const sheetSpec of sheetsToProcess) {
    const sheet = wb.Sheets[sheetSpec.name];
    if (!sheet) {
      console.log(`   ⚠ Sheet "${sheetSpec.name}" not found, skipping`);
      continue;
    }
    
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    if (rows.length < 2) {
      console.log(`   ⚠ Sheet "${sheetSpec.name}" has no data rows`);
      continue;
    }
    
    const headers = rows[0].map(h => String(h).trim().toLowerCase());
    const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim()));
    const currency = guessCurrency(sheetSpec.name);
    
    console.log(`\n4. Processing: ${sheetSpec.name} (${dataRows.length} rows, ${currency})`);
    
    // Find column indices
    const dateIdx = headers.findIndex(h => h.includes('fecha'));
    const descIdx = headers.findIndex(h => h.includes('descripción') || h.includes('descripcion'));
    const catIdx = headers.findIndex(h => h.includes('categoría') || h.includes('categoria'));
    const refIdx = headers.findIndex(h => h.includes('ref'));
    
    // Amount column - handle different formats
    let amountIdx, amountEurIdx;
    if (sheetSpec.name === 'Amex Platinum EUR') {
      // Amex has Importe Original and Importe EUR
      amountEurIdx = headers.findIndex(h => h.includes('importe eur'));
      amountIdx = amountEurIdx >= 0 ? amountEurIdx : headers.findIndex(h => h.includes('importe'));
    } else {
      amountIdx = headers.findIndex(h => h.includes('importe'));
    }
    
    if (dateIdx < 0 || descIdx < 0 || amountIdx < 0) {
      console.log(`   ✗ Cannot find required columns (date=${dateIdx}, desc=${descIdx}, amount=${amountIdx})`);
      continue;
    }
    
    let sheetImported = 0;
    let sheetSkipped = 0;
    
    for (const row of dataRows) {
      const dateStr = normalizeDate(row[dateIdx]);
      if (!dateStr) {
        sheetSkipped++;
        continue;
      }
      
      const description = String(row[descIdx] || '').trim();
      if (!description) {
        sheetSkipped++;
        continue;
      }
      
      const rawAmount = row[amountIdx];
      const amount = parseAmount(rawAmount);
      if (amount === 0) {
        sheetSkipped++;
        continue;
      }
      
      const category = catIdx >= 0 ? String(row[catIdx] || '').trim() : null;
      const ref = refIdx >= 0 ? String(row[refIdx] || '').trim() : null;
      
      // Determine type
      const isExpense = amount < 0 || String(rawAmount).trim().startsWith('-');
      const type = isExpense ? 'expense' : 'income';
      const absAmount = Math.abs(amount);
      
      // Determine project
      let projectName;
      if (sheetSpec.project) {
        projectName = sheetSpec.project;
      } else {
        // Dynamic allocation for Wio Business AED
        projectName = classifyWioBusiness(description);
      }
      
      const projectId = PROJECT_IDS[projectName];
      if (!projectId) {
        console.log(`   ⚠ Unknown project "${projectName}" for: ${description}`);
        sheetSkipped++;
        continue;
      }
      
      const paymentSourceId = PAYMENT_SOURCE_IDS[sheetSpec.paymentSource] || null;
      
      // Build external_id from ref + sheet for dedup
      const externalId = ref 
        ? `bank:${sheetSpec.name.replace(/\s+/g, '_').toLowerCase()}:${ref}`
        : null;
      
      allTransactions.push({
        project_id: projectId,
        date: dateStr,
        description: description,
        amount: String(absAmount.toFixed(2)),
        type: type,
        category: category || null,
        source_file: `bank_import:${sheetSpec.name.replace(/\s+/g, '_')}`,
        external_id: externalId,
        payment_source_id: paymentSourceId,
        business_unit_id: projectName === 'Audesign' ? BU_IDS.audesign 
          : projectName === 'A2G Talents' ? BU_IDS.talents
          : BU_IDS.holding,
        _project_name: projectName,
        _sheet: sheetSpec.name,
        _currency: currency,
      });
      
      sheetImported++;
    }
    
    stats[sheetSpec.name] = { total: dataRows.length, parsed: sheetImported, skipped: sheetSkipped };
    console.log(`   ✓ Parsed: ${sheetImported} txns, Skipped: ${sheetSkipped}`);
  }
  
  // Step 5: Allocation summary for Wio Business AED
  console.log('\n5. Wio Business AED Allocation:');
  const wioBizTxns = allTransactions.filter(t => t._sheet === 'Wio Business AED');
  const wioBizByProject = {};
  for (const t of wioBizTxns) {
    wioBizByProject[t._project_name] = (wioBizByProject[t._project_name] || 0) + 1;
  }
  for (const [proj, count] of Object.entries(wioBizByProject)) {
    console.log(`   ${proj}: ${count} txns`);
  }
  
  // Step 6: Dedup and import
  console.log('\n6. Importing transactions with dedup...');
  
  // Group by project for dedup
  const byProject = {};
  for (const t of allTransactions) {
    if (!byProject[t.project_id]) byProject[t.project_id] = [];
    byProject[t.project_id].push(t);
  }
  
  let totalImported = 0;
  let totalSkipped = 0;
  
  for (const [projectId, txns] of Object.entries(byProject)) {
    const projectName = txns[0]._project_name;
    
    // Separate by external_id presence
    const withExtId = txns.filter(t => t.external_id);
    const withoutExtId = txns.filter(t => !t.external_id);
    
    const toInsert = [];
    let skipped = 0;
    
    // Dedup by external_id
    if (withExtId.length > 0) {
      const existingExtIds = new Set();
      for (let i = 0; i < withExtId.length; i += 200) {
        const chunk = withExtId.slice(i, i + 200).map(t => t.external_id);
        const { data: existing } = await sb.from('transactions')
          .select('external_id')
          .in('external_id', chunk);
        for (const e of existing || []) {
          if (e.external_id) existingExtIds.add(e.external_id);
        }
      }
      
      for (const t of withExtId) {
        if (existingExtIds.has(t.external_id)) {
          skipped++;
        } else {
          toInsert.push(t);
        }
      }
    }
    
    // Dedup by date+amount+description for those without external_id
    if (withoutExtId.length > 0) {
      const { data: existing } = await sb.from('transactions')
        .select('date, amount, description, source_file')
        .eq('project_id', projectId)
        .range(0, 49999);
      
      const existingKeys = new Set(
        (existing || []).map(e => 
          `${e.date}|${e.amount}|${String(e.description || '').substring(0, 50)}|${e.source_file || ''}`
        )
      );
      
      for (const t of withoutExtId) {
        const key = `${t.date}|${t.amount}|${String(t.description || '').substring(0, 50)}|${t.source_file || ''}`;
        if (existingKeys.has(key)) {
          skipped++;
        } else {
          toInsert.push(t);
        }
      }
    }
    
    // Clean up internal fields before insert
    const cleanTxns = toInsert.map(t => {
      const { _project_name, _sheet, _currency, ...clean } = t;
      return clean;
    });
    
    if (cleanTxns.length > 0) {
      // Insert in chunks of 500
      let inserted = 0;
      for (let i = 0; i < cleanTxns.length; i += 500) {
        const chunk = cleanTxns.slice(i, i + 500);
        const { data: result, error } = await sb.from('transactions')
          .insert(chunk)
          .select('id');
        
        if (error) {
          console.error(`   ✗ Error inserting for ${projectName}:`, error.message);
          // Try one by one on error
          for (const single of chunk) {
            const { error: singleErr } = await sb.from('transactions').insert(single);
            if (singleErr) {
              console.error(`     ✗ Single insert error: ${single.description.substring(0, 40)} - ${singleErr.message}`);
              skipped++;
            } else {
              inserted++;
            }
          }
        } else {
          inserted += result?.length || 0;
        }
      }
      
      console.log(`   ${projectName}: ${inserted} imported, ${skipped} skipped (dedup)`);
      totalImported += inserted;
    } else {
      console.log(`   ${projectName}: 0 new (${skipped} already exist)`);
    }
    totalSkipped += skipped;
  }
  
  // Step 7: Summary
  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`Total parsed: ${allTransactions.length}`);
  console.log(`Total imported: ${totalImported}`);
  console.log(`Total skipped (dedup): ${totalSkipped}`);
  console.log('\nPer sheet:');
  for (const [sheet, s] of Object.entries(stats)) {
    console.log(`  ${sheet}: ${s.total} total, ${s.parsed} parsed, ${s.skipped} skipped`);
  }
  
  // Step 8: Verify final counts
  console.log('\n=== FINAL PROJECT COUNTS ===');
  const { data: allProjects } = await sb.from('projects').select('id, name').order('name');
  for (const p of allProjects || []) {
    const { count } = await sb.from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', p.id);
    console.log(`  ${p.name}: ${count} txns`);
  }
  
  // Step 9: Items needing manual review
  console.log('\n=== MANUAL REVIEW NEEDED ===');
  const ambiguousBiz = wioBizTxns.filter(t => {
    const desc = t.description.toLowerCase();
    // Transactions that defaulted to A2G Company but might belong elsewhere
    return t._project_name === 'A2G Company' && 
      !A2G_COMPANY_KEYWORDS.some(kw => desc.includes(kw)) &&
      !desc.includes('ftmo') && !desc.includes('trad') &&
      !desc.includes('wio') && !desc.includes('salary') &&
      !desc.includes('fee') && !desc.includes('transfer');
  });
  
  if (ambiguousBiz.length > 0) {
    console.log(`\n${ambiguousBiz.length} Wio Business AED txns defaulted to A2G Company (review allocation):`);
    for (const t of ambiguousBiz.slice(0, 30)) {
      console.log(`  ${t.date} | ${t.description.padEnd(40).substring(0, 40)} | ${t.amount} AED | ${t.category || '-'}`);
    }
    if (ambiguousBiz.length > 30) {
      console.log(`  ... and ${ambiguousBiz.length - 30} more`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

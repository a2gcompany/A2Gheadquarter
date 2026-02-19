#!/usr/bin/env node
/**
 * Fix misallocated Wio Business AED transactions
 * FACEBK → Audesign (these are Facebook/Meta Ads)
 * Semrush → Audesign (SEO tool)
 * Holded → A2G Company (accounting software for the holding)
 */

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const sb = createClient(
  process.env.SUPABASE_URL || 'https://hgxdozjewidhthlfsnhp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const AUDESIGN_ID = 'e232f7c0-3a86-4086-9567-8114d046c3ec';
const A2G_COMPANY_ID = '91e1287e-8e21-4e71-afaa-685566b6dc1e';
const BU_AUDESIGN = '597300f6-5612-4ab7-979e-9a84b4e76137';

// Patterns that should be Audesign but were misclassified
const AUDESIGN_PATTERNS = [
  'facebk',      // Facebook/Meta Ads
  'semrush',     // SEO tool for Audesign
  'typeform',    // Form builder
  'zapier',      // Automation (likely for Audesign)
  'ahrefs',      // SEO
  'hubspot',     // CRM
  'intercom',    // Customer support
  'twilio',      // SMS
  'sendgrid',    // Email
  'loom',        // Video recording
  'midjourney',  // AI for design
  'dall-e',      // AI for design
  'replicate',   // AI
  'elevenlabs',  // AI voice
  'cursor',      // AI coding
  'render',      // Hosting
  'supabase',    // Database
  'planetscale', // Database
  'railway',     // Hosting
  'replit',      // Coding
  'hostinger',   // Hosting
  'namecheap',   // Domain
  'cloudflare',  // CDN
  'digitalocean',// Hosting
  'hetzner',     // Hosting
  'mongodb',     // Database
];

async function main() {
  console.log('=== Fix Wio Business AED Allocation ===\n');
  
  // Get all Wio Business AED transactions currently under A2G Company
  const { data: txns, error } = await sb.from('transactions')
    .select('id, description, amount, date, category')
    .eq('project_id', A2G_COMPANY_ID)
    .eq('source_file', 'bank_import:Wio_Business_AED')
    .range(0, 49999);
  
  if (error) { console.error('Error:', error.message); return; }
  
  console.log(`Found ${txns.length} Wio Business AED txns under A2G Company`);
  
  let movedToAudesign = 0;
  const toMove = [];
  
  for (const t of txns) {
    const desc = t.description.toLowerCase();
    const shouldBeAudesign = AUDESIGN_PATTERNS.some(p => desc.includes(p));
    
    if (shouldBeAudesign) {
      toMove.push(t.id);
      movedToAudesign++;
    }
  }
  
  if (toMove.length > 0) {
    console.log(`\nMoving ${toMove.length} transactions to Audesign...`);
    
    // Update in chunks
    for (let i = 0; i < toMove.length; i += 100) {
      const chunk = toMove.slice(i, i + 100);
      const { error: updateErr } = await sb.from('transactions')
        .update({ 
          project_id: AUDESIGN_ID,
          business_unit_id: BU_AUDESIGN
        })
        .in('id', chunk);
      
      if (updateErr) {
        console.error('Update error:', updateErr.message);
      }
    }
    console.log(`✓ Moved ${movedToAudesign} txns to Audesign`);
  }
  
  // Show remaining A2G Company Wio Business txns for review
  const { data: remaining } = await sb.from('transactions')
    .select('description, amount, date, category')
    .eq('project_id', A2G_COMPANY_ID)
    .eq('source_file', 'bank_import:Wio_Business_AED')
    .order('date')
    .range(0, 49999);
  
  console.log(`\n=== Remaining ${remaining.length} A2G Company Wio Business txns ===`);
  
  // Group by category
  const byCat = {};
  for (const t of remaining) {
    const cat = t.category || 'uncategorized';
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(t);
  }
  
  for (const [cat, txns] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${cat} (${txns.length}):`);
    for (const t of txns.slice(0, 5)) {
      console.log(`    ${t.date} | ${t.description.padEnd(35).substring(0, 35)} | ${t.amount}`);
    }
    if (txns.length > 5) console.log(`    ... +${txns.length - 5} more`);
  }
  
  // Final counts
  console.log('\n=== UPDATED PROJECT COUNTS ===');
  const { data: projects } = await sb.from('projects').select('id, name').order('name');
  for (const p of projects) {
    const { count } = await sb.from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', p.id);
    if (count > 0) console.log(`  ${p.name}: ${count} txns`);
  }
}

main().catch(console.error);

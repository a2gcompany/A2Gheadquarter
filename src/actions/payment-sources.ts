"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type PaymentSource = {
  id: string
  business_unit_id: string | null
  name: string
  type: "bank" | "stripe" | "paypal" | "wise" | "cash" | "crypto"
  account_identifier: string | null
  currency: string
  is_active: boolean
  created_at: string
}

export async function getPaymentSources(): Promise<PaymentSource[]> {
  const { data, error } = await supabaseAdmin
    .from("payment_sources")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching payment sources:", error)
    return []
  }

  return data || []
}

export async function getActivePaymentSources(): Promise<PaymentSource[]> {
  const { data, error } = await supabaseAdmin
    .from("payment_sources")
    .select("*")
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching active payment sources:", error)
    return []
  }

  return data || []
}

export async function getPaymentSourcesByBusinessUnit(businessUnitId: string): Promise<PaymentSource[]> {
  const { data, error } = await supabaseAdmin
    .from("payment_sources")
    .select("*")
    .eq("business_unit_id", businessUnitId)
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching payment sources by business unit:", error)
    return []
  }

  return data || []
}

export async function getPaymentSource(id: string): Promise<PaymentSource | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_sources")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching payment source:", error)
    return null
  }

  return data
}

export async function createPaymentSource(data: {
  business_unit_id?: string
  name: string
  type: PaymentSource["type"]
  account_identifier?: string
  currency?: string
  is_active?: boolean
}): Promise<PaymentSource | null> {
  const { data: newSource, error } = await supabaseAdmin
    .from("payment_sources")
    .insert({
      ...data,
      currency: data.currency || "EUR",
      is_active: data.is_active ?? true
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating payment source:", error)
    return null
  }

  revalidatePath("/accounting")
  return newSource
}

export async function updatePaymentSource(
  id: string,
  data: Partial<Omit<PaymentSource, "id" | "created_at">>
): Promise<PaymentSource | null> {
  const { data: updated, error } = await supabaseAdmin
    .from("payment_sources")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating payment source:", error)
    return null
  }

  revalidatePath("/accounting")
  return updated
}

export async function deletePaymentSource(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("payment_sources")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting payment source:", error)
    return false
  }

  revalidatePath("/accounting")
  return true
}

import { createSupabaseClient } from "./supabase"

export async function createUserProfile(userId: string, email: string, name: string) {
  const supabase = createSupabaseClient()
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert([
        {
          user_id: userId,
          email: email,
          name: name,
          preferences: {
            time_commitment: "30 mins",
            goal: "",
            notifications_enabled: true,
          },
        },
      ])
      .select()

    if (error) {
      console.error("Profile creation error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error("Profile creation exception:", err)
    return { success: false, error: err }
  }
}

export async function getOrCreateUserProfile(userId: string, email: string, name: string) {
  const supabase = createSupabaseClient()
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (existingProfile && !fetchError) {
      return { success: true, data: existingProfile, created: false }
    }

    // If profile doesn't exist, create it
    const result = await createUserProfile(userId, email, name)
    return { ...result, created: true }
  } catch (err) {
    console.error("Get or create profile error:", err)
    return { success: false, error: err }
  }
}

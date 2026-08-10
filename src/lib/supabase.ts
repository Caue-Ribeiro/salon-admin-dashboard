import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

//export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let supabaseClientInstance: any = null

export const getSupabase = async () => {
    if (supabaseClientInstance) return supabaseClientInstance
    if ((window as any).supabase) {
        supabaseClientInstance = (window as any).supabase.createClient(
            supabaseUrl,
            supabaseAnonKey,
        )
        return supabaseClientInstance
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
        script.onload = () => {
            supabaseClientInstance = (window as any).supabase.createClient(
                supabaseUrl,
                supabaseAnonKey,
            )
            resolve(supabaseClientInstance)
        }
        script.onerror = reject
        document.head.appendChild(script)
    })
}

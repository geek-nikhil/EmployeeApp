
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { status } = await req.json() // 'Present' or 'Absent'

        // 1. Validate User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Validate Logic (One per day)
        // We can rely on DB Unique Constraint for this, or check first.
        // Also "Cannot mark attendance for future dates" - DB defaults to current_date, so we just use that.
        // If user sends 'date', ignore it and use server date (DB default) or validate it matches today.
        // We'll let DB handle 'date' default to `current_date`.

        // 3. Insert
        const { data, error } = await supabaseClient
            .from('attendance')
            .insert({
                user_id: user.id,
                status: status,
                // date: defaults to today
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Attendance already marked for today')
            }
            throw error
        }

        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

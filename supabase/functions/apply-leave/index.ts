
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

        const { type, start_date, end_date, total_days, reason } = await req.json()

        // 1. Validate User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Validate Dates
        const start = new Date(start_date)
        const end = new Date(end_date)
        if (start > end) throw new Error('Invalid date range')
        if (start < new Date()) throw new Error('Cannot apply for past dates (unless allowed)')

        // 3. Check Overlap via RPC
        const { data: hasOverlap, error: overlapError } = await supabaseClient
            .rpc('has_leave_overlap', {
                u_id: user.id,
                s_date: start_date,
                e_date: end_date
            })

        if (overlapError) throw overlapError
        if (hasOverlap) throw new Error('Leave dates overlap with existing request')

        // 4. Insert Request
        const { data, error } = await supabaseClient
            .from('leave_requests')
            .insert({
                user_id: user.id,
                type,
                start_date,
                end_date,
                total_days,
                reason,
                status: 'Pending'
            })
            .select()
            .single()

        if (error) throw error

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

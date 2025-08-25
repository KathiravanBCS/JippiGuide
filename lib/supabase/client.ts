
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxhtorhdyctcjcxzcich.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aHRvcmhkeWN0Y2pjeHpjaWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTEyNzksImV4cCI6MjA3MDM2NzI3OX0.d2MwwInFqqeGVEyRP1NMHa1B1iaoaX2G-hIR_ziRXF4';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
	return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

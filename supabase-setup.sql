-- ================================================================
-- Foldi — Supabase Setup Script
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ── 1. Schema changes ──────────────────────────────────────────

-- Add status column (pending / approved / rejected)
ALTER TABLE icon_packs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Track which auth user submitted each pack
ALTER TABLE icon_packs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill existing rows so they pass RLS SELECT (they're already live)
UPDATE icon_packs SET status = 'approved' WHERE status = 'pending';

-- ── 2. Row Level Security on icon_packs ────────────────────────

ALTER TABLE icon_packs ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved packs (used by app + website marketplace)
CREATE POLICY "Public reads approved packs"
  ON icon_packs FOR SELECT
  USING (status = 'approved');

-- Authenticated users can read their own packs regardless of status
CREATE POLICY "Users read own packs"
  ON icon_packs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert — status is forced to 'pending' by DB default
CREATE POLICY "Authenticated users can submit packs"
  ON icon_packs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending packs (pre-approval retract)
CREATE POLICY "Users delete own pending packs"
  ON icon_packs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- ── 3. Storage bucket policies for "icon-packs" ────────────────
-- Run these from: Supabase Dashboard → Storage → icon-packs → Policies

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload icons"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'icon-packs');

-- Public can read/download icons
CREATE POLICY "Public can view icons"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'icon-packs');

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete own icons"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'icon-packs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 4. (Optional) Admin role helper ───────────────────────────
-- To let a specific user approve/reject packs without the service key,
-- set their user metadata to {"role": "admin"} in the Supabase auth dashboard,
-- then add this policy:

-- CREATE POLICY "Admins can update pack status"
--   ON icon_packs FOR UPDATE
--   TO authenticated
--   USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
--   WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

/*
  # Schéma initial pour Azɔ̀ Yìkpɔ́

  1. Nouvelles Tables
    - `profiles`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers auth.users)
      - `role` (text, 'user' ou 'collector')
      - `full_name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `collection_requests`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers auth.users)
      - `collector_id` (uuid, référence vers auth.users, nullable)
      - `status` (text)
      - `latitude` (float8)
      - `longitude` (float8)
      - `created_at` (timestamp)
      - `completed_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour les utilisateurs et les éboueurs
*/

-- Création de la table des profils
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    role text NOT NULL DEFAULT 'user',
    full_name text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_role CHECK (role IN ('user', 'collector'))
);

-- Création de la table des demandes de collecte
CREATE TABLE public.collection_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    collector_id uuid REFERENCES auth.users,
    status text NOT NULL DEFAULT 'pending',
    latitude float8 NOT NULL,
    longitude float8 NOT NULL,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled'))
);

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_requests ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Politiques pour collection_requests
CREATE POLICY "Les utilisateurs peuvent voir leurs propres demandes"
    ON public.collection_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Les éboueurs peuvent voir toutes les demandes"
    ON public.collection_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role = 'collector'
        )
    );

CREATE POLICY "Les utilisateurs peuvent créer des demandes"
    ON public.collection_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role = 'user'
        )
    );

CREATE POLICY "Les éboueurs peuvent mettre à jour les demandes"
    ON public.collection_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role = 'collector'
        )
    );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
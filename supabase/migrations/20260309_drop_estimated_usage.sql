-- Remove coluna estimated_usage da tabela leads
-- Este campo nunca é preenchido pelo formulário de contacto.
-- A funcionalidade foi substituída pelo campo needs (multi-select).

ALTER TABLE public.leads DROP COLUMN IF EXISTS estimated_usage;

-- Renomear colunas para uniformidade com o código TypeScript
-- company_name → company
-- interests → needs

ALTER TABLE public.leads RENAME COLUMN company_name TO company;
ALTER TABLE public.leads RENAME COLUMN interests TO needs;

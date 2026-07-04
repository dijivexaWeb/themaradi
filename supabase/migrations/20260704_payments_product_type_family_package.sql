-- purchaseFamilyAction 'family_package' product_type ile insert yapiyordu ama constraint
-- bunu kabul etmiyordu (onceden var olan bug, bu migration'la ilgisi yoktu).
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_product_type_check;
ALTER TABLE payments ADD CONSTRAINT payments_product_type_check CHECK (product_type IN (
  'memorial_one_time', 'vault_setup', 'vault_monthly', 'family_package'
));

-- Migration: Add Azul payment gateway fields
-- Replaces PayPal integration with Azul (Dominican Republic payment gateway)

-- Add Azul fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS azul_order_id TEXT,
ADD COLUMN IF NOT EXISTS azul_token TEXT;

-- Add Azul fields to payment_history table
ALTER TABLE payment_history
ADD COLUMN IF NOT EXISTS azul_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS azul_authorization_code TEXT,
ADD COLUMN IF NOT EXISTS amount_itbis DECIMAL(10,2);

-- Add Azul customer token to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS azul_customer_token TEXT;

-- Create index on azul_order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_azul_order_id ON subscriptions(azul_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_azul_transaction_id ON payment_history(azul_transaction_id);

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.azul_order_id IS 'Azul payment gateway order ID';
COMMENT ON COLUMN subscriptions.azul_token IS 'Azul DataVault token for recurring payments';
COMMENT ON COLUMN payment_history.azul_transaction_id IS 'Azul transaction ID (AzulOrderId)';
COMMENT ON COLUMN payment_history.azul_authorization_code IS 'Azul authorization code for successful payments';
COMMENT ON COLUMN payment_history.amount_itbis IS 'ITBIS tax amount (18% in DR)';
COMMENT ON COLUMN clients.azul_customer_token IS 'Azul DataVault token for saved card';

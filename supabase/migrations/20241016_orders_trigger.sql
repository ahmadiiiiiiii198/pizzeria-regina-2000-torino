-- Create function to call Edge Function when new order is inserted
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  request_id BIGINT;
BEGIN
  -- Get the Edge Function URL from environment or use default
  -- This will be configured in Supabase Dashboard
  edge_function_url := current_setting('app.edge_function_url', true);
  
  -- If not set, use default local/production URL
  IF edge_function_url IS NULL THEN
    edge_function_url := 'https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification';
  END IF;

  -- Make HTTP POST request to Edge Function (async)
  -- Using pg_net extension if available, otherwise log for webhook setup
  BEGIN
    -- Try to use pg_net if available
    SELECT net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
      ),
      body := jsonb_build_object(
        'order_id', NEW.id::text,
        'customer_name', NEW.customer_name,
        'total_amount', NEW.total_amount,
        'items_count', (SELECT COUNT(*) FROM order_items WHERE order_id = NEW.id),
        'delivery_type', NEW.delivery_type
      )
    ) INTO request_id;

    RAISE NOTICE 'Push notification request sent: %', request_id;
  EXCEPTION WHEN OTHERS THEN
    -- If pg_net is not available, just log
    RAISE NOTICE 'New order notification triggered for order: % (customer: %, amount: %)', 
      NEW.id, NEW.customer_name, NEW.total_amount;
    RAISE NOTICE 'pg_net not available - please configure webhook manually in Supabase Dashboard';
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;

CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Add comment
COMMENT ON FUNCTION notify_new_order() IS 'Triggers push notification Edge Function when new order is inserted';
COMMENT ON TRIGGER trigger_notify_new_order ON orders IS 'Calls Edge Function to send push notifications for new orders';

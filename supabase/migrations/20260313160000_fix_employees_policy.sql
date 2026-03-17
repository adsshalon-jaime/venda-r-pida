-- Drop existing policy and create a more permissive one for testing
DROP POLICY IF EXISTS "Users can manage employees" ON employees;

-- Create a policy that allows all operations (for development/testing)
CREATE POLICY "Enable all operations for employees" ON employees
  FOR ALL USING (true)
  WITH CHECK (true);

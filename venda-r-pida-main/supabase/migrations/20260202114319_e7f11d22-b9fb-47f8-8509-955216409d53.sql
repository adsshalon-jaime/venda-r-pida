-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lona', 'tenda')),
  standard_meterage NUMERIC NOT NULL DEFAULT 0,
  base_price NUMERIC NOT NULL DEFAULT 0,
  price_per_square_meter BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table with optional customer reference
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lona', 'tenda')),
  quantity INTEGER,
  width NUMERIC,
  length NUMERIC,
  square_meters NUMERIC,
  total_value NUMERIC NOT NULL DEFAULT 0,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read, authenticated write)
CREATE POLICY "Anyone can view products" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert products" 
ON public.products FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
ON public.products FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete products" 
ON public.products FOR DELETE 
USING (true);

-- Create policies for customers
CREATE POLICY "Anyone can view customers" 
ON public.customers FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert customers" 
ON public.customers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers" 
ON public.customers FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete customers" 
ON public.customers FOR DELETE 
USING (true);

-- Create policies for sales
CREATE POLICY "Anyone can view sales" 
ON public.sales FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert sales" 
ON public.sales FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales" 
ON public.sales FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete sales" 
ON public.sales FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
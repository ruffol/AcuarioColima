-- Run this in your Supabase SQL Editor
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products table
create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  nombre_es text not null,
  nombre_en text not null,
  descripcion_es text,
  descripcion_en text,
  historia_es text,
  historia_en text,
  categoria_es text not null,
  categoria_en text not null,
  precio_mxn integer not null check (precio_mxn > 0),
  precio_usd numeric(10,2) not null check (precio_usd > 0),
  stock integer not null default 0 check (stock >= 0),
  peso_kg numeric(5,2),
  imagen_principal text,
  imagenes text[] default '{}',
  destacado boolean default false,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  nombre text,
  pais text not null,
  direccion jsonb,
  moneda text not null check (moneda in ('MXN', 'USD')),
  subtotal integer not null,
  costo_envio integer not null,
  total integer not null,
  payment_provider text not null check (payment_provider in ('stripe', 'paypal')),
  payment_id text,
  payment_status text not null default 'pending',
  stripe_session_id text,
  paypal_order_id text,
  created_at timestamptz default now()
);

-- Order items table
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null check (quantity > 0),
  precio_unitario integer not null
);

-- Stock decrement function (for webhook)
create or replace function decrement_stock(product_id uuid, quantity integer)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set stock = stock - quantity
  where id = product_id and stock >= quantity;
end;
$$;

-- Indexes
create index idx_products_slug on products(slug);
create index idx_products_categoria_es on products(categoria_es);
create index idx_products_categoria_en on products(categoria_en);
create index idx_products_destacado on products(destacado) where destacado = true;
create index idx_orders_created on orders(created_at desc);
create index idx_order_items_order on order_items(order_id);

-- RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Products are publicly readable"
  on products for select using (true);

create policy "Products are admin writable"
  on products for insert using (false);
create policy "Products are admin updatable"
  on products for update using (false);
create policy "Products are admin deletable"
  on products for delete using (false);

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('productos', 'productos', true);
create policy "Product images are publicly viewable"
  on storage.objects for select using (bucket_id = 'productos');
create policy "Product images are admin uploadable"
  on storage.objects for insert using (bucket_id = 'productos');

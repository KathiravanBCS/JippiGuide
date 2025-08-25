-- Destinations Table
create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text
);

insert into destinations (name, description, image_url) values
('Paris', 'The city of lights.', 'https://yourdomain.com/images/dest-1.png'),
('Tokyo', 'A vibrant metropolis.', 'https://yourdomain.com/images/dest-2.png');

-- Gallery Table
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text
);

insert into gallery (title, image_url) values
('Eiffel Tower', 'https://yourdomain.com/images/gallery-1.png'),
('Mount Fuji', 'https://yourdomain.com/images/gallery-2.png');

-- Packages Table
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric,
  description text,
  image_url text
);

insert into packages (name, price, description, image_url) values
('Romantic Paris', 1200, 'A 5-day trip to Paris for couples.', 'https://yourdomain.com/images/package-1.png'),
('Tokyo Explorer', 1500, 'A 7-day adventure in Tokyo.', 'https://yourdomain.com/images/package-2.png');

-- Stories Table
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  author text,
  image_url text,
  created_at timestamp with time zone default now()
);

insert into stories (title, content, author, image_url) values
('A Parisian Adventure', 'Exploring the hidden gems of Paris.', 'Alice', 'https://yourdomain.com/images/story-1.png'),
('Tokyo Nights', 'Experiencing the vibrant nightlife of Tokyo.', 'Bob', 'https://yourdomain.com/images/story-2.png');

-- Travelers Table
create table if not exists travelers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text
);

insert into travelers (name, bio, avatar_url) values
('Alice', 'A passionate traveler and storyteller.', 'https://yourdomain.com/images/traveler-1.png'),
('Bob', 'Loves exploring new cultures and cuisines.', 'https://yourdomain.com/images/traveler-2.png');

-- Plans Table
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid references travelers(id),
  place_id uuid, -- You may want to reference a POI table if you have one
  added_at timestamp with time zone default now()
);

-- Example insert (replace with actual traveler_id and place_id)
-- insert into plans (traveler_id, place_id) values ('<traveler-uuid>', '<place-uuid>');
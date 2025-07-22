CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"seeker_id" varchar NOT NULL,
	"listing_id" integer NOT NULL,
	"message" text,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"rent" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"location" varchar(255) NOT NULL,
	"room_type" varchar(100),
	"available" boolean DEFAULT true NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"amenities" text[] DEFAULT '{}' NOT NULL,
	"preferences" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"listing_id" integer,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'SEEKER' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
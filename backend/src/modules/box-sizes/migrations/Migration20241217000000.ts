import { Migration } from '@mikro-orm/migrations';

export class Migration20241217000000 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "box_size" ("id" text not null, "name" text not null, "length" real not null, "width" real not null, "height" real not null, "weight_limit" real not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "box_size_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "box_size" cascade;');
  }

}

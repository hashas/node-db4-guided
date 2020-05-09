
exports.up = async function(knex) {
	await knex.schema.createTable("zoos", (table) => {
		table.increments("id")
		// the following can be 'string' or 'text' data type as sqlite will convert
		// to varchar in either case
		table.text("name").notNull()
		table.text("address").notNull().unique()
	})

	// order matters generally (although might not in sqlite it does in postgress and co.)
	// "species" table must be created before "animals" because the latter references the
	// the former
	await knex.schema.createTable("species", (table) => {
		table.increments("id")
		table.text("name").notNull().unique()
	})

	await knex.schema.createTable("animals", (table) => {
		table.increments("id")
		table.text("name").notNull()
		table.integer("species_id")
			.references("id")
			.inTable("species")
			// if we change the "id" in "species" table then onUpdate("CASCADE")
			// will automatically update "species_id" accordingly in the "animals" table
			.onUpdate("CASCADE")
			// this is essentially saying whenever the primary key that this column is
			// pointing at gets deleted then set the value of this foreign key to null
			// instead of giving us an error in DB Browser
			// .onDelete("SET NULL")

			// this on the other hand will TRY to delete the foreign key in the "animals"
			// table when we delete the species in "species" table, BUT as we have another
			// table thats still referencing rows of animals i.e. our join table "zoos_animals"
			// is pointing to rows in our "animals" table. Therefore onDelete is cascading down 
			// to "animals" but NOT to "zoos_animals", so we'd just need to specify
			// onDelete("CASCADE") reference in the "zoos_animals" table
			.onDelete("CASCADE")
	})

	// create our join table
	await knex.schema.createTable("zoos_animals", (table) => {
		table.integer("zoo_id")
			.references("id")
			.inTable("zoos")
			// we specify our CASCADE reference option again on these references so that the
			// onDelete("CASCADE") reference we specified above can cascade down to this table/
			// references. Now when a single "species" row is deleted, it will delete all references
			// in other tables which are associated with that reference("species")
			.onUpdate("CASCADE")
			.onDelete("CASCADE")
		table.integer("animal_id")
			.references("id")
			.inTable("animals")
			// specify CASCADE reference again here
			.onUpdate("CASCADE")
			.onDelete("CASCADE")
		table.date("from_date")
		table.date("to_date")
		// since this table doesn't need an ID column, we can
		// make primary key a combo of our two foreign key columns (this
		//will def be unique as we can't have more than one combo of the zoo_id
		// animal_id).
		table.primary(["zoo_id", "animal_id"])
	})
};

exports.down = async function(knex) {
	// we want to drop this table first because it has foreign keys in it
	// we want to drop "zoos_animals" before we drop "animals"
	// otherwise we'll have a foreign key pointing to a table that doesn't exist
	await knex.schema.dropTableIfExists("zoos_animals")
	await knex.schema.dropTableIfExists("animals")
	await knex.schema.dropTableIfExists("species")
	await knex.schema.dropTableIfExists("zoos")

};

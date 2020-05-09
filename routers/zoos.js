const express = require("express")
const db = require("../data/config")

const router = express.Router()

router.get("/", async (req, res, next) => {
	try {
		res.json(await db("zoos"))
	} catch(err) {
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const zoo = await db("zoos")
			.where("id", req.params.id)
			.first()
		
		if (!zoo) {
			return res.status(404).json({
				message: "Zoo not found",
			})
		}

		res.json(zoo)
	} catch(err) {
		next(err)
	}
})

router.get("/:id/animals", async (req, res, next) => {
	try {
		const animals = await db("zoos_animals as za")
			.join("zoos as z", "z.id", "za.zoo_id")
			.join("animals as a", "a.id", "za.animal_id")
			.join("species as s", "s.id", "a.species_id")
			.where("z.id", req.params.id)
			.select("a.*", "s.name as species_name", "za.from_date", "za.to_date")

		res.json(animals)			
	} catch (err) {
		next(err)
	}
})

module.exports = router
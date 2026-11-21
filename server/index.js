import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import verifyToken from "./middlewares/verifyToken.js";

const app = express();
const port = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors())
app.use(express.json())

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const sportNestDb = await mongoClient.db("sport_nest_db");
const facilitiesCollection = await sportNestDb.collection("facilities");
const facilitiesBookingCollection = await sportNestDb.collection("facilitiesBooking");



app.get('/', (req, res) => {
  res.send('Hello World!');
});

// app.get('/facilities', async (req, res) => {
//   const result = await facilitiesCollection.find().toArray();
//   res.send(result);
// });



app.get('/facilities', async (req, res) => {
  try {
    const result = await facilitiesCollection.find().toArray();

    res.status(200).send({
      success: true,
      message: "Successfully get facilities data",
      data: result
    });

  }

  catch (err) {
    console.error(err);

    res.status(500).send({
      success: false,
      message: "Internal Server Error"
    })
  }
});





// app.post('/facilities', async (req, res) => {
//   const facilityData = req.body;
//   const result = facilitiesCollection.insertOne(facilityData)
//   res.send(result);
// });


app.post('/facilities', async (req, res) => {
  try {
    const facilityData = req.body;    

    if(
      !facilityData || 
      typeof facilityData !== "object" ||
      Array.isArray(facilityData) ||
      Object.keys(facilityData).length === 0
    ) {

      return res.status(400).send({
        success: false,
        message: "Invalid facility data"
      })

    }

    const result = await facilitiesCollection.insertOne(facilityData);

    res.status(201).send({
      success: true,
      message: "Inserted Facility Successfully",
      insertedId: result.insertedId
    });
  }

  catch (err) {
    console.error("Failed to create facility ", err);

    res.status(500).send({
      success: false,
      message: "Internal Server Error"
    })
  }
});


app.post('/facilities/booking', async (req, res) => {
    try {
        const facilityBookingData = req.body;

        // Validate request body
        if (
            !facilityBookingData ||
            typeof facilityBookingData !== "object" ||
            Array.isArray(facilityBookingData) ||
            Object.keys(facilityBookingData).length === 0
        ) {
            return res.status(400).send({
                success: false,
                message: "Invalid booking data"
            });
        }

        // Validate Facility ID
        const { facility } = facilityBookingData;

        if (
            typeof facility !== "string" ||
            !ObjectId.isValid(facility)
        ) {
            return res.status(400).send({
                success: false,
                message: "Invalid facility ID"
            });
        }

        // Check if facility still exists
        const existingFacility = await facilitiesCollection.findOne({
            _id: new ObjectId(facility)
        });

        if (!existingFacility) {
            return res.status(404).send({
                success: false,
                message: "This facility is no longer available"
            });
        }

        // Insert booking
        const result = await facilitiesBookingCollection.insertOne(
            facilityBookingData
        );

        return res.status(201).send({
            success: true,
            message: "Booking created successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.error("Failed to create booking:", error);

        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});


app.get('/facilities/booking', verifyToken, async (req, res) => {
    try {
        const userID = req.user.sub;

        if (!userID) {
            return res.status(400).send({
                success: false,
                message: "User ID is required"
            });
        }

        const result = await facilitiesBookingCollection
            .find({ userID })
            .toArray();

        res.status(200).send({
            success: true,
            message: "Successfully retrieved user bookings",
            data: result
        });

    } catch (err) {
        console.error("Failed to fetch bookings", err);

        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});




app.get("/facilities/my-facilities", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            return res.status(400).send({
                success: false,
                message: "User ID is required",
            });
        }

        const result = await facilitiesCollection
            .find({ userId })
            .toArray();

        return res.status(200).send({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).send({
            success: false,
            message: "Failed to fetch facilities",
        });
    }
});


app.delete('/facilities/booking/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate booking ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: "Invalid booking ID"
            });
        }

        // Check if booking exists
        const booking = await facilitiesBookingCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!booking) {
            return res.status(404).send({
                success: false,
                message: "Booking not found"
            });
        }

        // Delete booking
        const result = await facilitiesBookingCollection.deleteOne({
            _id: new ObjectId(id)
        });

        return res.status(200).send({
            success: true,
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error("Error cancelling booking:", error);

        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});



app.delete('/facilities/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: "Invalid facility ID"
            });
        }

        // Check if facility exists
        const facility = await facilitiesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!facility) {
            return res.status(404).send({
                success: false,
                message: "Facility not found"
            });
        }

        // Delete all bookings associated with this facility
        const bookingResult = await facilitiesBookingCollection.deleteMany({
            facility: id
        });

        // Delete the facility
        const facilityResult = await facilitiesCollection.deleteOne({
            _id: new ObjectId(id)
        });

        return res.status(200).send({
            success: true,
            message: "Facility deleted successfully",
            deletedBookings: bookingResult.deletedCount
        });

    } catch (error) {
        console.error("Error deleting facility:", error);

        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});

app.get('/facilities/:id', async (req, res) => {
  try {
    const {id} = req.params;

    if(!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid facility ID"
      })
    }

    const result = await facilitiesCollection.findOne({
      _id: new ObjectId(id)
    });

    // Handle facility not found
    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Facility not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Successfully get facilities data",
      data: result
    });

  }

  catch (err) {
    console.error(err);

    res.status(500).send({
      success: false,
      message: "Internal Server Error"
    })
  }
});



// Get existing bookings for a specific facility and date
app.get('/facilities/:id/bookings', async (req, res) => {
    try {
        const { id } = req.params;
        const { bookingDate } = req.query;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: "Invalid facility ID"
            });
        }

        if (
            typeof bookingDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)
        ) {
            return res.status(400).send({
                success: false,
                message: "A valid booking date is required"
            });
        }

        const facility = await facilitiesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!facility) {
            return res.status(404).send({
                success: false,
                message: "Facility not found"
            });
        }

        const result = await facilitiesBookingCollection
            .find(
                {
                    facility: id,
                    bookingDate
                },
                {
                    projection: {
                        _id: 1,
                        startTime: 1,
                        endTime: 1
                    }
                }
            )
            .toArray();

        return res.status(200).send({
            success: true,
            message: "Successfully retrieved existing bookings",
            data: result
        });

    } catch (error) {
        console.error("Failed to fetch existing bookings:", error);

        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});




app.patch('/facilities/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate Facility ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: "Invalid facility ID"
            });
        }

        // Validate request body
        if (
            !updateData ||
            typeof updateData !== "object" ||
            Array.isArray(updateData) ||
            Object.keys(updateData).length === 0
        ) {
            return res.status(400).send({
                success: false,
                message: "Invalid update data"
            });
        }

        // Only allow these fields to be updated
        const allowedFields = [
            "name",
            "sportType",
            "imageUrl",
            "location",
            "pricePerHour",
            "capacity",
            "availableTimeRanges",
            "description"
        ];

        const fields = Object.keys(updateData);

        const hasInvalidField = fields.some(
            (field) => !allowedFields.includes(field)
        );

        if (hasInvalidField) {
            return res.status(400).send({
                success: false,
                message: "Invalid field provided"
            });
        }

        // Validate string fields
        const stringFields = [
            "name",
            "sportType",
            "imageUrl",
            "location",
            "description"
        ];

        for (const field of stringFields) {
            if (
                field in updateData &&
                (typeof updateData[field] !== "string" ||
                    !updateData[field].trim())
            ) {
                return res.status(400).send({
                    success: false,
                    message: `Invalid ${field}`
                });
            }
        }

        // Validate price
        if (
            "pricePerHour" in updateData &&
            (
                typeof updateData.pricePerHour !== "number" ||
                !Number.isFinite(updateData.pricePerHour) ||
                updateData.pricePerHour < 0
            )
        ) {
            return res.status(400).send({
                success: false,
                message: "Invalid price per hour"
            });
        }

        // Validate capacity
        if (
            "capacity" in updateData &&
            (
                !Number.isInteger(updateData.capacity) ||
                updateData.capacity <= 0
            )
        ) {
            return res.status(400).send({
                success: false,
                message: "Invalid capacity"
            });
        }

        // Validate available time ranges
        if ("availableTimeRanges" in updateData) {
            const isValidTime = (time) =>
                typeof time === "string" &&
                /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

            const isValidRanges =
                Array.isArray(updateData.availableTimeRanges) &&
                updateData.availableTimeRanges.every((range) => {
                    if (
                        !range ||
                        !isValidTime(range.startTime) ||
                        !isValidTime(range.endTime)
                    ) {
                        return false;
                    }

                    return range.startTime < range.endTime;
                });

            if (!isValidRanges) {
                return res.status(400).send({
                    success: false,
                    message: "Invalid available time ranges"
                });
            }
        }

        // Check if facility exists
        const facility = await facilitiesCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!facility) {
            return res.status(404).send({
                success: false,
                message: "Facility not found"
            });
        }

        // Update facility
        await facilitiesCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: updateData
            }
        );

        // Get updated facility
        const updatedFacility = await facilitiesCollection.findOne({
            _id: new ObjectId(id)
        });

        return res.status(200).send({
            success: true,
            message: "Facility updated successfully",
            data: updatedFacility
        });

    } catch (error) {
        console.error("Error updating facility:", error);

        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
});




app.post('/facilities', async (req, res) => {
  try {
    const facilityData = req.body;

    // Check required fields
    if (
      !facilityData.name ||
      !facilityData.sportType ||
      !facilityData.imageUrl ||
      !facilityData.location ||
      facilityData.pricePerHour == null ||
      facilityData.capacity == null ||
      !Array.isArray(facilityData.availableTimeSlots) ||
      !facilityData.description
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required facility fields"
      });
    }

    const result = await facilitiesCollection.insertOne(facilityData);

    res.status(201).send({
      success: true,
      message: "Facility created successfully",
      data: {
        _id: result.insertedId,
        ...facilityData
      }
    });

  } catch (err) {
    console.error("Error creating facility:", err);

    res.status(500).send({
      success: false,
      message: "Internal Server Error"
    });
  }
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
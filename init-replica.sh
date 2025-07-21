#!/bin/bash
echo "Waiting for MongoDB to start..."
sleep 5

echo "Initiating replica set..."
mongosh --eval '
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }]
})
'

const AWS = require("aws-sdk");
const Archiver = require("archiver");

AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_KEY,
});

const s3 = new AWS.S3();

const zip = Archiver("zip");

exports.handler = async (event, context, callback) => {
  try {
    // sample response from dynamo
    const tracksToAdd = ["Ideas.mp3", "I Miss The Old Me Too.mp3"];

    // const result = await s3.getObject(params).promise();
    const trackRequests = tracksToAdd.map((track) =>
      s3.getObject({ Bucket: "lexribbit", Key: track }).promise()
    );

    const resolvedTracks = await Promise.all(trackRequests);
    // trackName includes extension e.g. Ideas.mp3 Swager.aiff
    const allBuffers = resolvedTracks.map((track) => track.Body);
    // const buffer = result.Body;

    // // Send the file to the page output.
    // zip.pipe(res);

    // Create zip with some files. Two dynamic, one static. Put #2 in a sub folder.
    allBuffers.forEach((buffer, index) =>
      zip.append(buffer, { name: tracksToAdd[index] })
    );

    zip.finalize();

    res.writeHead(200, {
      "Content-Type": "application/zip",
      "Content-disposition": "attachment; filename=MuhCustomAlbum.zip",
    });

    // res.json({ data: true });
  } catch (error) {
    res.status(500);
    res.json({ data: error.message });
  }
};

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number },
  genre: { type: String },
  imageUrl: { type: String },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      grade: { type: Number, min: 0, max: 5 },
    }
  ],
  averageRating: { type: Number, default: 0 },
}, { timestamps: true });

bookSchema.method('toJSON', function() {
  const { __v, ...object } = this.toObject();
  object.id = object._id.toString();
  return object;
});

module.exports = mongoose.model('Book', bookSchema);
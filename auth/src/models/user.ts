import mongoose from 'mongoose';
import { Password } from '../services/password';

// interface that describe the properties that are required to create a User
interface UserAttrs {
  email: string;
  password: string;
}

// interface that describe the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// interface that describe the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      requierd: [true, 'User must have an email'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'User must have an email-password']
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await Password.toHash(this.password);
  }
  next();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };

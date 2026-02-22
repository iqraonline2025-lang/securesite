import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("TeamMember", teamMemberSchema);
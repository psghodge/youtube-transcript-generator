// User model schema and validation
export class User {
  constructor(data) {
    this.id = data.id; // Firebase Auth UID
    this.email = data.email;
    this.displayName = data.displayName || "";
    this.photoURL = data.photoURL || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validate user data
  static validate(data) {
    if (!data.id) throw new Error("User ID is required");
    if (!data.email) throw new Error("Email is required");
    return true;
  }

  // Convert to Firebase document
  toFirestore() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create from Firebase document
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      ...data,
    });
  }
}

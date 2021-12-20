const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//Creating a Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain "password"')
            }
        }
    }, 
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

//Joining user with tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//Filter the viewable parameters
userSchema.methods.toJSON = function() {
    //changing the user to object
    const userObject = this.toObject()

    //removing the non-viewable/secure fields
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//Generate auth tokens during signup and login
userSchema.methods.generateAuthToken = async function() {
    //creating the token
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 })
    //saving the token in user table
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token
}

//Find user by email and password during login
userSchema.statics.findByCredentials = async(email, password) => {
    //finding the user by given email
    const user = await User.findOne({ email })
    
    if(!user){
        throw new Error('Bad Credentials')
    }
    //check if password is matching
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Bad Credentials')
    }
    return user
}

//Hashing password before saving
userSchema.pre('save', async function(next){
    //checking if there is password field in the user input
    if(this.isModified('password')){
        //Hashing password using bcrypt 
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

//Delete all task before user delete
userSchema.pre('remove', async function(next){
    //deleting all the tasks
    await Task.deleteMany({ owner: this._id })
    next()
})

//Creating the User model
const User = mongoose.model('User', userSchema)

module.exports = User
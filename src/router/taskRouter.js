const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//Create a new task
router.post('/tasks', auth, async(req, res) => {
    // const task = new Task(req.body)
    //creating the task
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt:desc
//Get all tasks of the authenticated user
router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    if(req.query.completed){
        match.completed = req.query.completed === 'true'? true : false
    }
    try{
        //get all tasks
        // const tasks = await Task.find({ user: req.user._id })

        // if(tasks.length < 1){
        //     return res.status(404).send({message: 'No tasks found. Please create a task first.'})
        // }
        // res.send(tasks)

        //query for the task table
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

//Get a particular task of the authenticated user by its id
router.get('/tasks/:id', auth, async(req, res) => {
    //fetching the id from URL
    const _id = req.params.id

    try{
        // const task = await Task.findById(_id)
        //finding the task with id
        const task = await Task.findOne({ _id, user: req.user._id})

        if(!task){
            return res.status(404).send({message: 'No such task found.'})
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

//Updating any task of a authenticated user
router.patch('/tasks/:id', auth, async(req, res) => {

    //getting the key values of the given json
    const updates = Object.keys(req.body)
    //creating only the updatable fields array
    const allowedUpdates = ['description', 'completed']
    //checking if the keys provided in the request matches the updatable fields
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({ error: 'Invalid Updates' })
    }

    //fetching the id from URL
    const _id = req.params.id

    try{
        //finding the requested task
        const task = await Task.findOne({ _id, user: req.user._id})
        // const task = await Task.findByIdAndUpdate(_id, req.body, { new:true, runValidators:true })

        if(!task){
            return res.status(404).send({message: 'No such task found.'})
        }
        //updating the task with the required changes
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//Delete any task of the authenticated user
router.delete('/tasks/:id', auth, async(req,res) => {
    //fetching the id from URL
    const _id = req.params.id

    try{
        //find the task and deleting it
        const task = await Task.findOneAndDelete({ _id, user: req.user._id })

        if(!task){
            return res.status(404).send({ message: 'No such task found.' })
        }

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router
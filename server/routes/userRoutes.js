import express from 'express'
import { addUserRating, getUserProjectProgress, getUserData, updateUserProjectProgress, userEnrolledProjects } from '../controllers/userController.js';


const userRouter = express.Router()

// Get user Data
userRouter.get('/data', getUserData)
userRouter.get('/enrolled-projects', userEnrolledProjects)
userRouter.post('/update-project-progress', updateUserProjectProgress)
userRouter.post('/get-project-progress', getUserProjectProgress)
userRouter.post('/add-rating', addUserRating)

export default userRouter;
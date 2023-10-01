import express from 'express';
import { handleRegisterUser, handleLogin, handleAvatar, 
    deleteOldPic, handleAddContact, handleGetContacts} from '../Controllers/userController.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js';
const router = express.Router();

router.post('/register', handleRegisterUser )  
router.post('/login', handleLogin ) 
router.put('/set-avatar', verifyAccessToken, handleAvatar) 
router.put('/add-contact', verifyAccessToken, handleAddContact) 
router.post('/get-contacts', verifyAccessToken, handleGetContacts) 
router.delete('/delete-pic', verifyAccessToken, deleteOldPic) 

export const userRouter = router;
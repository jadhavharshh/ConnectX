import { Router } from "express";
import { 
  FETCH_MENTOR, 
  FETCH_DOCUMENT_CATEGORIES, 
  FETCH_DOCUMENTS, 
  UPLOAD_DOCUMENT, 
  DELETE_DOCUMENT 
} from "../controllers/MenteeController";

const MenteeRoutes = Router();

MenteeRoutes.get('/fetch-mentor', FETCH_MENTOR);
MenteeRoutes.get('/document-categories', FETCH_DOCUMENT_CATEGORIES);
MenteeRoutes.get('/documents', FETCH_DOCUMENTS);
MenteeRoutes.post('/upload-document', UPLOAD_DOCUMENT);
MenteeRoutes.delete('/delete-document', DELETE_DOCUMENT);

export default MenteeRoutes;
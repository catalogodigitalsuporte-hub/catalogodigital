import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB78DA4TdelF3_JJEHOY-wxyBS2sELF-BMG",
  authDomain: "catalogo-digital-7f15a.firebaseapp.com",
  projectId: "catalogo-digital-7f15a",
  storageBucket: "catalogo-digital-7f15a.appspot.com",
  messagingSenderId: "848923132623",
  appId: "1:848923132623:web:b17a7ac711aec8780a1aba",
  // measurementId: "G-6H9SYCYX6B" // Opcional para este projeto
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar os serviços que serão usados
export const auth = getAuth(app);
export const db = getFirestore(app);

// Opcional: Exportar o app para outros serviços como Storage
export default app;

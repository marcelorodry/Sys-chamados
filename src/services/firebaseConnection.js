import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyC5DY01FZ5YDqNey164fjsmzFRiJDrogRo",
    authDomain: "sistema-de-chamados-60b6b.firebaseapp.com",
    projectId: "sistema-de-chamados-60b6b",
    storageBucket: "sistema-de-chamados-60b6b.appspot.com",
    messagingSenderId: "1088950826827",
    appId: "1:1088950826827:web:d4f726041930197ba55ace",
    measurementId: "G-32EZTB6SDE"
  };
  
if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
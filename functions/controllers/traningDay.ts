import * as functions from "firebase-functions";
import * as express from "express";
import * as admin from "firebase-admin";
import * as cors from "cors";

import * as serviceAccount from "../ServiceAccount.json";

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};
admin.initializeApp({
  credential: admin.credential.cert(params),
});

const db = admin.firestore();

const tdApp = express();
tdApp.use(cors({ origin: true }));

// get TraningDaylist
tdApp.get("/api/traningDays", (req, res) => {
  (async () => {
    try {
      const query = db.collection("TraniningDays");
      const response = [] as any;
      await query.get().then((querySnapShot) => {
        const docs = querySnapShot.docs;
        for (const doc of docs) {
          const selectedTraningDays = {
            id: doc.id,
            traningDay: doc.data(),
          };
          response.push(selectedTraningDays);
        }
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// get traningday by id
tdApp.get("/:traningdayId", (req, res) => {
  (async () => {
    try {
      const document = db
          .collection("TraniningDays")
          .doc(req.params.traningdayId);
      const traningDay = await document.get();
      const response = traningDay.data();
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// create traningDay (add rules later)

tdApp.post("/create", async (req, res) => {
  const createdTraningDay = req.body;
  await db.collection("TraniningDays").add(createdTraningDay);

  res.status(201).send();
});

// delete traningDay
tdApp.delete("/:traningdayId", async (req, res) => {
  await db.collection("TraniningDays").doc(req.params.traningdayId).delete();
  res.status(200).send();
});
export const traningDay = functions.https.onRequest(tdApp);

import { useEffect, useState } from "react";

function PatientsList() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        (async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/patients`);
            const data = await res.json();
            setPatients(data);
        })();
    }, []);


    return (
        <div>
            <h1> Liste des patients</h1>
            <ul>
                {patients.map((p) => (
                    <li key={p.id}>{p.nom} {p.prenom}</li>
                ))}
            </ul>
        </div>
    );
}

export default PatientsList;
async function apiRequest(action, data = {}) {

    const payload = {

        action: action,

        ...data

    };


    const requestBody =
        JSON.stringify(payload);


    const attempts = [

        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        },

        {
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
                "Accept": "application/json"
            }
        }

    ];


    console.log(
        "API REQUEST:",
        payload
    );


    for (const attempt of attempts) {

        try {

            const response = await fetch(
                CONFIG.API_URL,
                {
                    method: "POST",
                    headers: attempt.headers,
                    body: requestBody
                }
            );



            const status = response.status;
            const statusText = response.statusText;
            const text = await response.text();

            if (!response.ok) {
                // Return server body as message to help debugging (may be HTML or JSON)
                let parsed = null;
                try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
                return {
                    status: false,
                    message: parsed?.message || (`HTTP ${status} ${statusText}: ` + (text ? text.slice(0, 200) : 'no body')),
                    raw: text
                };
            }

            // Read response text (successful)

            


            let result = null;



            if (text) {
                try {
                    result = JSON.parse(text);
                } catch (error) {
                    result = { status: true, message: text };
                }
            } else {
                result = { status: true, message: "OK" };
            }


            console.log(
                "API RESPONSE:",
                result
            );


            return result;


        } catch (error) {

            console.error(
                "API ERROR:",
                error
            );

        }

    }


    return {

        status: false,

        message:
            "Tidak dapat terhubung ke server."

    };

}
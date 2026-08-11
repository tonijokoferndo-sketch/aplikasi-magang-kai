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


            if (!response.ok) {

                continue;

            }


            const text =
                await response.text();


            let result = null;


            if (text) {

                try {

                    result = JSON.parse(text);

                } catch (error) {

                    result = {
                        status: true,
                        message: text
                    };

                }

            } else {

                result = {
                    status: true,
                    message: "OK"
                };

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
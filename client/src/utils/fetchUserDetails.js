import httpClient from "@/backend/http/legacyClient";
import SummaryApi from "@/backend/contracts/summaryApi";

const fetchUserDetails = async () => {
    try {
        const response = await httpClient({
            ...SummaryApi.userDetails
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export default fetchUserDetails
var ppc_number = 47110577306;
var client = new WindowsAzure.MobileServiceClient('https://couponprodwest.azure-mobile.net/', 'noowhTBIYfzVrXOcFrNSwIFbkMoqRh19');              // Prod West
var couponMetadataTable = client.getTable('cp_query_read_metadata');
var storeAddressQuery = client.getTable('CP_Store_Address_Query');
var couponHistoryQuery = client.getTable('ecry_cp_query_coupon_history');
var addToCardQuery = client.getTable('ecry_cp_query_add_to_card');
var couponIDForCardQuery = client.getTable('ecry_cp_couponid_a_c_for_card');
couponIDForCardQuery.insert({ ppc_number: ppc_number }).then(function(result) {

        var availableCouponArray = result.available_ids_array;
        var clippedCouponArray = result.clipped_active_ids_array;

        console.log("Coupon query result is %o",result);
        addAllCuopons(availableCouponArray);
});
function addAllCuopons(couponItems){
    if(couponItems == null){
        alert("Nothing to add");
    }
    var count = 0;
    var fail = 0;
    for(var i =0 ; i< couponItems.length;i++){
        savetoquery(couponItems[i]);    
        count++;
    }

    alert("Added " + count + " cuopons to card and " + fail + " failed")
}
function handleAddError(error) {
    var text = error + (error.request ? ' - ' + error.request.status : '');
    alert("Can't Add Coupon. Error - " + text);
}


function savetoquery(id){
    addToCardQuery.insert({
        ppc_number: ppc_number,
        coupon_id: id,
        clip_source: 'Web_SR'
    }).done(function(result) {
        console.log("Callback result is %0" ,result);
        if (result.result == true) {
            return true
        } else {
            couponResult = false;
            var errMsg;
        
            switch (result.codes[0].code) {
                case '000':
                    errMsg = 'Application Error';
                    break;
                case '4100':
                    errMsg = 'Coupon already on card or redeemed';
                    break;
                case '4103':
                    errMsg = 'Coupon has hit download limit';
                    break;
                case '1205':
                    errMsg = 'Card is invalid';
                    break;
                case '1208':
                    errMsg = 'Unable to find coupons for ids provided ';
                    break;
                case '1210':
                    errMsg = 'Unable to add coupons to card';
                    break;
            }
            
            if (result.codes[0].code != '000') {
               // alert("Error - " + errMsg);
               console.log("Error - " + errMsg)
            }
        }

    }, handleAddError);
    return false;
}
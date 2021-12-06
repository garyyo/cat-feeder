let URL_Base = "http://cat-feeder"
let URL_Status = URL_Base + "/status"
let URL_Log = URL_Base + "/log"
let URL_Request = URL_Base + "/sched"
let URL_Feeder = URL_Base + "/feeder"

let rowTemplate = `
<tr>
    <td class="cat-feeder-index"></td>
    <td class="cat-feeder-enabled">
        <div class="form-check form-switch">
            <label class="form-check-label"><input class="form-check-input" type="checkbox" role="switch"></label>
        </div>
    </td>
    <td class="cat-feeder-time"> <input type="time" name="time"> </td>
    <td class="cat-feeder-enable1">
        <div class="form-check form-switch">
            <label class="form-check-label"><input class="form-check-input" type="checkbox" role="switch"></label>
        </div>
    </td>
    <td class="cat-feeder-enable2">
        <div class="form-check form-switch">
            <label class="form-check-label"><input class="form-check-input" type="checkbox" role="switch"></label>
        </div>
    </td>
    <td class="cat-feeder-scoops"> <input type="number" name="scoop"></td>
    <td class="cat-feeder-save"> <button class="btn btn-primary">Save</td>
</tr>
`

function fixTime(badTime){
    return badTime.split(":").map(n => String(Number(n)).padStart(2, "0")).join(":")
}

function determineEnabled(enabledIndex) {
    if (enabledIndex === "0"){
        return [true, false]
    }
    if (enabledIndex === "1"){
        return [false, true]
    }
    if (enabledIndex === "2"){
        return [true ,true]
    }
    return [false, false]
}
function reverseDetermineEnabled(enabledArr) {
    if (enabledArr[0] && !enabledArr[1]){return 0}
    if (!enabledArr[0] && enabledArr[1]){return 1}
    if (enabledArr[0] && enabledArr[1]){return 2}
    if (!enabledArr[0] && !enabledArr[1]){return -1}
}

function buildRow(feederConfig){
    let row = $(rowTemplate, {})
    let whichEnabled = determineEnabled(feederConfig.feeder)

    //index
    row.find(".cat-feeder-index").text(feederConfig.slot)
    row.find(".cat-feeder-index-input").val(feederConfig.slot)

    // is enabled
    row.find(".cat-feeder-enabled input").prop("checked", feederConfig.off !== "checked")

    // time
    row.find(".cat-feeder-time input").val(fixTime(feederConfig.time))

    // which one is enabled
    row.find(".cat-feeder-enable1 input").prop("checked", whichEnabled[0])
    row.find(".cat-feeder-enable2 input").prop("checked", whichEnabled[1])

    // how many scoops
    row.find(".cat-feeder-scoops input").val(Number(feederConfig.scoop))

    // validation stuff
    row.find("input").on("change", () => {
        // change the color of the save button when a change of any sort is detected
        row.find(".cat-feeder-save button").removeClass("btn-primary").addClass("btn-danger")
    })

    row.find(".cat-feeder-save button").click((e) => {
        let enabled = Boolean(row.find(".cat-feeder-enabled input").prop("checked"))
        let slot = feederConfig.slot
        let feeder1Enabled = Boolean(row.find(".cat-feeder-enable1 input").prop("checked"))
        let feeder2Enabled = Boolean(row.find(".cat-feeder-enable2 input").prop("checked"))
        let feeder = String(reverseDetermineEnabled([feeder1Enabled, feeder2Enabled]))
        let scoop = row.find(".cat-feeder-scoops input").val()
        let time = row.find(".cat-feeder-time input").val()

        let formData = {
            "slot": slot,
            "feeder": feeder,
            "scoop": scoop,
            "time": time
        }

        if (!enabled) {
            formData.off = "0"
        }

        console.log(formData)
        $.get(URL_Request, formData, () => {}, "text/plain")

        row.find(".cat-feeder-save button").removeClass("btn-danger").addClass("btn-primary")
    })

    return row
}

function tempDisableChanges(){
    $("#manual-feed-april").attr("disabled", true)
    $("#manual-feed-mia").attr("disabled", true)
    window.setTimeout(() => {

        $("#manual-feed-april").attr("disabled", false)
        $("#manual-feed-mia").attr("disabled", false)
    }, 5000)
}

window.onload = () => {
    fetch(URL_Log)
        .then(r => r.json())
        .then(feeders => {
        for(let feederConfig of feeders) {
            let row = buildRow(feederConfig)
            $("#feeder-table").append(row)
        }
    })

    $("#manual-feed-april").click(() => {$.get(URL_Feeder, {"feeder": 0}); tempDisableChanges()})
    $("#manual-feed-mia").click(() => {$.get(URL_Feeder, {"feeder": 1}); tempDisableChanges()})
}
fetch(URL_Status).then(r => r.text()).then(t => {
    document.getElementById('status').innerHTML = t;
})


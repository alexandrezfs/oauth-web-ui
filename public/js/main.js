function confirmDelete(actionPath) {

    swal({
        title: "Are you sure?",
        text: "You will not be able to recover this client!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    }, function () {
        document.location.href = actionPath;
    });

    return false;

};
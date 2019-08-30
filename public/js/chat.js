
var socket = io();


    socket.on('connect',function (){
    console.log('connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join',params,function(err){
        if(err){
            alert('provide valid name and room name');
            window.location.href('/');
        }else {
            console.log('user joined');
        }
    });
    });
    socket.on('disconnect',function (){
    console.log('Server is disconnected');
    });

    jQuery('#message-form').on('submit',function(e){
        e.preventDefault();
        var Textbox = jQuery('[name=message]');
        socket.emit('createMessage',{
            from : 'user',
            text : Textbox.val()
        },function(){
            Textbox.val('');
        });
    });
   
   
   
    socket.on('newMessage',(Message)=>{
        console.log('new Message',Message);
        var formattedTime = moment(Message.createdAt).format('h:mm a');
        var template = jQuery('#message-template').html();
        var html = Mustache.render(template,{
            from : Message.from,
            text : Message.text,
            createdAt : formattedTime
        });

        jQuery('#messages').append(html);
    });

    socket.on('newLocMessage',function(data){
        var formattedTime = moment(data.createdAt).format('h:mm a');
        var template = jQuery('#location-message-template').html();
        var html = Mustache.render(template,{
            from : data.from,
            url : data.url,
            createdAt : formattedTime
        });
        jQuery('#messages').append(html);

    });




    var locationbtn = jQuery('#send-location');
    locationbtn.on('click',function(e){
        if(!navigator.geolocation){
        alert('your browser not support geolocation');
    }
    locationbtn.attr('disabled','disabled').text('sending location');
    navigator.geolocation.getCurrentPosition(function(position){
        locationbtn.removeAttr('disabled').text('send location');
        console.log(position);
        socket.emit('createLocMessage',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },function(){
            
        });
    },function(){
        locationbtn.removeAttr('disabled').text('send location');
    });
});

---
layout: page
title: Hours Logger
permalink: /
---

<!--Add buttons to initiate auth sequence and sign out-->
<button id="authorize_button" style="display: none;">Authorize</button>
<button id="signout_button" style="display: none;">Sign Out</button>

<div id="content" style="white-space: pre-wrap;"></div>

<script type="text/javascript" src="https://code.jquery.com/jquery-1.12.0.min.js"></script>

<script src='exec.js'></script>

<script id="apiscript" async defer src="https://apis.google.com/js/api.js"
  onload="this.onload=function(){};handleClientLoad()"
  onreadystatechange="if (this.readyState === 'complete') this.onload()">
</script>



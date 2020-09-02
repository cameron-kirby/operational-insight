#Operational Insight

A one-stop shop for management to view operational status of their department including resource utilization, team skillset, vacation plans, project alerts.

##REST Service Specifications v1.2

**Caesar Cavales**

**Nghi D. Ho**

**Harish Yayi**

**Jacob Wernette**

**Micah Brown**

**Xunrong Li**

##Table Of Contents

- [1.Basic Authentication](#1basic-authentication)
	- [Supplying Basic Authentication headers](#supplying-basic-authentication-headers)
	- [Response](#response)
	- [Errors](#errors)
- [2.Projects: get list](#2projects-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [3.Projects: Update](#3projects-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [4.Projects: get details](#4projects-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
		- [Parameters](#parameters)
	- [Response](#response)
	- [Errors](#errors)
- [5.Projects: add](#5projects-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [6.Projects : delete](#6projects-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [7.Users: get list](#7users-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [8.Users: get details](#8users-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [9.Users: update](#9users-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [10.Users: insert](#10users-insert)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [11.Users: delete](#11users-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [12.Skill: get list](#12skill-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [13.Skills: Update](#13skills-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [14.Skills: get details](#14skills-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [15.Skills: add](#15skills-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [16.Skills: delete](#16skills-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [17.Search: get list](#17search-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [18.Dropdown: get list](#18dropdown-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [19.Newsfeeds: get list](#19newsfeeds-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [20.Newsfeed: Update](#20newsfeed-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [21.Newsfeed: get details](#21newsfeed-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [22.Newsfeed: add](#22newsfeed-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [23.Newsfeed: delete](#23newsfeed-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [24.ProjectStatus: get details](#24projectstatus-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [25.ProjectStatus: add](#25projectstatus-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [26.ProjectStatus: Update](#26projectstatus-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [27.ProjectStatus: delete](#27projectstatus-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [28.ProjectProcess: get details](#28projectprocess-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [29.ProjectProcess: add](#29projectprocess-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [30.ProjectProcess: Update](#30projectprocess-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [31.ProjectProcess: delete](#31projectprocess-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [32.ProjectGeo: get details](#32projectgeo-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [33.ProjectGeo: add](#33projectgeo-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [34.ProjectGeo: Update](#34projectgeo-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [35.ProjectGeo: delete](#35projectgeo-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [36.JobRoles: get details](#36jobroles-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [37.JobRoles: add](#37jobroles-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [38.JobRoles: Update](#38jobroles-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [39.JobRoles: delete](#39jobroles-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [40.Categories: get details](#40categories-get-details)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [41.Categories: add](#41categories-add)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [42.Categories: Update](#42categories-update)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [43.Categories: delete](#43categories-delete)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)
- [44.Categories: get list](#44categories-get-list)
	- [Request](#request)
		- [HTTP request](#http-request)
		- [Parameters](#parameters)
		- [Request body](#request-body)
	- [Response](#response)
	- [Errors](#errors)


#1.Basic Authentication

Resource Utilization allows REST clients to authenticate themselves with
a user name and password using [*basic authentication
*](http://en.wikipedia.org/wiki/Basic_access_authentication).

>POST /login

##Supplying Basic Authentication headers

You need construct and send basic auth headers together with your API
call. To do this you need to perform the following steps:

1.  Build a string of the form username:password

2.  Base64 encode the string

3.  Supply an "Authorization" header with content "Basic " followed by
    the encoded string. For example, the string "nghi:nghi" encodes to "
    bmdoaTpuZ2hp" in base64.

##Response

Below is the sample response body

	{

	"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJoeWF5aUB1cy5pYm0uY29tIwiZXhwIjoxNDM3Mzk5NDg0NDM4fQ.UbPPML2FCAHnQou5JfN0xanMIRETjgz87id9LN0hkD4",

	"user": {

	"expires": 1437399484438,

	"userName": "hyayi@us.ibm.com",

	"fname": "Harish",

	"lname": "Yayi",

	"userRole": "Admin"

	}

	}

##Errors
| Error type        			| Error Details         | Description  |
| --------------------------- |-----------------------| -------------|
| Unauthorized (401)      		| Invalid credentials   | This error is thrown if the user provides invalid credentials. |
| Internal Server Error (500) | InternalError         |   The server encountered an unexpected condition which prevented it from fulfilling the request. |
| Forbidden (403) 				| Not authorized        |    This error message is thrown if the user does not have a record in the database and tries to access the application.|

###Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Credentials"
}
```


#2.Projects: get list

Returns a list of projects that match the API request parameters.

##Request

###HTTP request

> GET /rest/v1/projects?limit={limit}&offset={offset}&user={user}&parts=(name,status,totalpeople,totalhours)&sort=UTIL\_DESC&treemap={true/false}&range={range}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name	   | Value           	| Required  | Description  |
| ----------------- |-------------------| ----------|--------------|
| limit      			| unsigned integer 	| No        |The limit parameter specifies the maximum number of items that should be returned in the result set.|
| offset      		| unsigned integer 	| No        |The offset parameter specifies from which index value the items should be returned|
| user(optional) 	| string      		| No        |The user parameter specifies a user ID for the resource(s) that are being retrieved. If a user ID is specified, the api returns all the project(s) where the specified user ID is a team member of the project. If not specified, api returns all the project(s) irrespective of the user ID.|
| parts(optional) 	| string      		| No        |The **parts** parameter specifies a comma-separated list of one or more request resource properties that the API response will include. If **parts** is omitted, API response includes name, status, totalhours, totalpeople.|
| sort(optional) 	| string      		| No        |If the sort parameter is specified as “UTIL\_DESC”, then the API returns the projects in the descending order of the utilization.|
| treemap(optional) | string      		| No        |If the treemap parameter is set to true it only returns the projects whose total hours is atleast 5% greater than the project which has highest totalhours|
| range(optional) 	| string      		| No        | The range parameter is not required(optional), but if not specified in the url, default is taken as ‘today’. Different types of ranges that are supported are ‘alltime’,’today’,’uptotoday’,’last30days’,’last90days’,’next30days’,’next90days’. When the range is specified the API response includes all the projects that fall in that range. For example, if the range is specified as ‘today’, it returns all the projects which are active today with the specified statuses.|


###Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure. Status code = 200.

Ex :
/rest/v1/projects?limit=4&offset=0&parts=(name,status,totalpeople,totalhours)&sort=”UTIL\_SORT”&range=next30days&treemap=true

	{
	  "kind": "Resource#ProjectsList",
	  "pageInfo": {
	    "totalResults": 5,
	    "resultsPerPage": "4"
	  },
	  "items": [
	    {
	      "name": "Discover",
	      "status": "Active New Development",
	      "people_count": 4,
	      "proj_id": "558c249f279332f59d16b69a",
	      "total_hours": 415
	    },
	    {
	      "name": "Engage Support",
	      "status": "Active Ongoing Support",
	      "people_count": 5,
	      "proj_id": "558da44ce4b0cfb129e126c9",
	      "total_hours": 4215
	    },
	    {
	      "name": "Operational Insight",
	      "status": "Active New Development",
	      "people_count": 3,
	      "proj_id": "558da457e4b0cfb129e126ca",
	      "total_hours": 3910
	    },
	    {
	      "name": "Big Blue Queue",
	      "status": "Active New Development",
	      "people_count": 6,
	      "proj_id": "558da442e4b0cfb129e126c8",
	      "total_hours": 3319
	    }
	  ]
	}

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	   			| Error details      | Description  |
| --------------------- |-------------------| --------------|
| unauthorized (401)    | badtoken 		    | Invalid token or missing        |
| badrequest (400)	    | badrequest 	    | This error is thrown if the limit, offset or parts parameter is not specified properly|
| Internal Server Error (500)    | InternalError     | The server encountered an unexpected condition which prevented it from fulfilling the request|


###Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#3.Projects: Update

Update a project’s properties. Only Admin and User are authorized to do
this.

##Request

###HTTP request

>PUT rest/v1/projects/{projectId}

If only few attributes of the project document are provided, then only
those attributes would be updated keeping the value of the other
attributes same.

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

| Parameter name	   | Value           	| Required  | Description  |
| ----------------- |-------------------| ----------|--------------|
|  projectId        |string   |Yes      |  The projectId parameter specifies project ID for the resource that is being updated. In a project resource, the projectID property specifies the project’s ID in Projects resource document. |

###Request body

Provide a project resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

	{
	  "name": "Big Blue Queue",
	  "description": "BBQ provides an intelligent routing and distribution system for workflow activities within IBM. Approval activities of BBQ adopters can be sent to a central queue and distributed to the approver via eMail, Web or Mobile channels to streamline and improve the efficiency of this workflow globally. ",
	  "IPT_record": "IPT-000002119",
	  "status": "Active New Development",
	  "process": "Innovation",
	  "geo": "WW",
	  "project_managers": [
	    {
	      "id": "mural@us.ibm.com"
	    }
	  ],
	  "technical_leads": [
	    {
	      "id": "nghi@us.ibm.com"
	    }
	  ]
	}

##Response

If successful, this method returns a request resource in the response body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.


| Error type        | Error details           | Description  |
| ------------------ |-------------| -----|
|  notFound (404)    | Project not found | The project ID identified by the request's projectId parameter cannot be found.|
|  badrequest (400)  | badrequest | This error is expected, if a invalid parameter is passed in the url. |
|  Forbidden (403)   | Not authorized | This error message is thrown if the user is trying to access a resource which he/she is not authorized |
|  Unauthorized (401)| badtoken |This error is expected when the token is invalid or missing. |
|Internal Server Error (500)| InternalError |The server encountered an unexpected condition which prevented it from fulfilling the request.|


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#4.Projects: get details

Returns project details based on the project ID specified.

##Request

###HTTP request

>GET rest/v1/projects/{projectId}&range={range}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’.

An optional date filter can be provided in the URL, if it is provided in
the URL, then the API returns only the team members who are working on
the project during that time period. If not provided, response includes
all the team members.

###Request body

Do not provide a request body when calling this method.

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value           | Required  | Description |
| ------------- |-------------| -----|-----|
|  projectId     | string | No |  The projectId parameter specifies project ID for the resource that is to be retrieved. In a project resource, the projectID property specifies the project’s ID in Projects resource document.|
|  range     |  string | No | The range parameter is not required(optional), but if not specified in the url, default is taken as ‘today’. Different types of ranges that are supported are ‘alltime’,’today’,’uptotoday’,’last30days’,’last90days’,’next30days’,’next90days’. When the range is specified the API response includes only the team members who are working during that particular time period. |

##Response

If successful, this method returns details of the project in its
response body. Below is the sample format of the response body. Status
code = 200.

	{
	  "kind": "Resource#ProjectDetails",
	  "item": {
	    "_id": "558c249f279332f59d16b69a",
	    "name": "Big Blue Queue",
	    "description": "BBQ provides an intelligent routing and distribution system for workflow activities within IBM. Approval activities of BBQ adopters can be sent to a central queue and distributed to the approver via eMail, Web or Mobile channels to streamline and improve the efficiency of this workflow globally. ",
	    "IPT_record": "IPT-000002119",
	    "status": "Active New Development",
	    "process": "Innovation",
	    "geo": "WW",
	    "technical_leads": [
	      {
	        "lname": "YAYI",
	        "fname": "HARISH",
	        "cc": "us",
	        "notesid": "Harish Yayi/Raleigh/IBM",
	        "uid": "5G0975897",
	        "id": "hyayi@us.ibm.com",
	        "_id": "5592aec89b8f8f3e593bcc62",
	        "email": "hyayi@us.ibm.com"
	      }
	    ],
	    "project_managers": [
	      {
	        "id": "nghi@us.ibm.com",
	        "uid": "4G6108897",
	        "notesid": "Nghi D Ho/Raleigh/IBM",
	        "cc": "us",
	        "fname": "Nghi D.",
	        "lname": "Ho",
	        "_id": "5592aec89b8f8f3e593bcc78",
	        "email": "nghi@us.ibm.com"
	      }
	    ],
	    "deliverable": {
	      "agreed": "2015-12-24T00:00:00.000Z",
	      "estimate": "2015-12-24T00:00:00.000Z"
	    },
	    "team": [
	      {
	        "id": "nghi@us.ibm.com",
	        "uid": "4G6108897",
	        "notesid": "Nghi D Ho/Raleigh/IBM",
	        "cc": "us",
	        "fname": "Nghi D.",
	        "lname": "Ho",
	        "_id": "5592aec89b8f8f3e593bcc60",
	        "email": "nghi@us.ibm.com",
	        "utilization": "30"
	      },
	      {
	        "id": "hyayi@us.ibm.com",
	        "uid": "5G0975897",
	        "notesid": "Harish Yayi/Raleigh/IBM",
	        "cc": "us",
	        "fname": "HARISH",
	        "lname": "YAYI",
	        "_id": "5592aec89b8f8f3e593bcc61",
	        "email": "hyayi@us.ibm.com",
	        "utilization": "25"
	      }
	    ],
	    "people_count": 2,
	    "total_hours": 367
	  }
	}

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

|Error type        | Error detail           | Description  |
| ------------- |-------------| -----|
|   unauthorized (401)    | badtoken |  This error is expected when the token is invalid or missing.|
|   notFound (404)    |    Project not found   |  The project with id projectId cannot be found. |
| Internal Server Error (500) |  InternalError     |   The server encountered an unexpected condition which prevented it from fulfilling the request.  |
| badrequest (400)| badrequest |This error is expected, if a invalid parameter is passed in the url. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#5.Projects: add

This api is for creating a new project in Operational Insight. Only
Admin and User are authorized to do this.
##Request

###HTTP request

>POST rest/v1/projects

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

###Request body

Provide a request resource in the request body.

	{
	  "name": "Big Blue Queue",
	  "description": "BBQ provides an intelligent routing and distribution system for workflow activities within IBM. Approval activities of BBQ adopters can be sent to a central queue and distributed to the approver via eMail, Web or Mobile channels to streamline and improve the efficiency of this workflow globally. ",
	  "IPT_record": "IPT-000002119",
	  "status": "Active New Development",
	  "process": "Innovation",
	  "geo": "WW",
	  "technical_leads": [
	    {
	      "id": "nghi@us.ibm.com"
	    }
	  ],
	  "project_managers": [
	    {
	      "id": "nghi@us.ibm.com"
	    }
	  ],
	  "deliverable": {
	    "estimate": "2015-12-24",
	    "agreed": "2015-12-24"
	  },
	  "team": [
	    {
	      "id": "nghi@us.ibm.com",
	      "job_role": "Tech Lead"
	    },
	    {
	      "id": "mural@us.ibm.com",
	      "job_role": "Project Manager"
	    },
	    {
	      "id": "hyayi@us.ibm.com",
	      "job_role": "Developer"
	    },
	    {
	      "id": "lixu@us.ibm.com",
	      "job_role": "Developer"
	    },
	    {
	      "id": "brownsm@us.ibm.com",
	      "job_role": "Developer"
	    }
	  ]
	}

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type        | Error detail           | Description  |
| ------------- |-------------| -----|
| Internal Server Error (500)      | InternalError | The server encountered an unexpected condition which prevented it from fulfilling the request.|
| forbidden (403)      | Not Authorized      |   The request is not properly authorized.|
| unauthorized (401) | badtoken      |    This error is expected when the token is invalid or missing. |
|badrequest (400)| badrequest |This error is expected, if a invalid|


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#6.Projects : delete

Deletes a project. Only admin is authorized to delete the project. Only
Admin is authorized to do this.

##Request

###HTTP request

>DELETE /rest/v1/admin/projects/{projectId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

###Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value           | Required  | Description |
| ------------- |-------------| -----|-----|
|  projectId     | string | No |  The projectId parameter specifies project ID for the resource that is being deleted. In a project resource, the projectID property specifies the project’s ID in Projects resource document.|

###Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type        | Error detail           | Description  |
| ------------- |-------------| -----|
|notFound (404)| Project not found |The project ID identified by the request's projectId parameter cannot be found.|
| Internal Server Error (500)      | InternalError | The server encountered an unexpected condition which prevented it from fulfilling the request.|
| forbidden (403)      | Not Authorized      |   The request is not properly authorized.|
| unauthorized (401) | badtoken      |    This error is expected when the token is invalid or missing. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#7.Users: get list

Returns a list of users that match the API request parameters. Everyone
has privilege to make this call.

##Request

### HTTP request

> GET /rest/v1/users/?skill={skill\_id}&onVacation={Boolean}&role={role}
> &limit={limit}&offset={offset}

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.


| Parameter name       | Value           | Required  | Description |
| -------------------- 	|-----------------| ----------|-------------|
|   skill    		| string  			| No |The skill parameter specifies the skill for the user(s) that are being retrieved. In a user resource, the skill property specifies any skill that the user may have. If skill is not provided, the user(s) returned will not be filtered by skill. If skill={skill\_id} is present, the response is identical to the default however ***only the requested skill is present in the response*** (rather than all skills each user knows)|
|   onVacation  	| boolean 			| No |The onVacation parameter is a flag that specifies whether the client wishes to only see the upcoming vacations (rather than the entire user doc). The only recognized value for onVacation is ‘true’ – all other values will be ignored. Note that onVacation takes precedence over skill and category.|
|   role    		| string 				| No |The role parameter specifies whether you wish to only have users with a specific role returned to you. The options are “User”, “Viewer”, or “Admin”|
|   limit   		| unsinged string 	| No |The limit parameter specifies the maximum number of user(s) that should be returned in the result set. The default value is 10. The limit parameter is only implemented when onVacations is set to true.|
|   offset     	| unsigned string 	| No |The offset parameter specifies the amount of resource(s) to be skipped in the result set. The default value is 0. The offset parameter is only implemented when onVacations is set to true.|


### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structures (status code 200). Note that the response varies depending on
which parameters are specified.

**Case 1**: default, display all users. This will display all users who
have a role of either ‘User’ or ‘Admin’. Additionally, the output is
formatted such that managers will be displayed before users. Then, the
non-managers will be sorted alphabetically by last name.

	{
	  "kind": "resource#userListResponse",
	  "pageInfo": {
	    "totalResults": 1
	  },
	  "items": [
	    {
	      "_id": "brownsm@us.ibm.com",
	      "_rev": "asdhj2398dhwdskjfh2",
	      "status": "Active",
	      "job_title": "Intern",
	      "isManager": "False",
	      "employee_type": "Regular",
	      "email": "brownsm@us.ibm.com",
	      "lname": "Brown",
	      "fname": "Micah S.",
	      "cc": "US",
	      "notesid": "Micah S Brown/Raleigh/IBM",
	      "uid": "4G9643897",
	      "dob": "754148082",
	      "phone_number": "6501231234",
	      "num_projects": 3,
	      "skills": [
	        {
	          "id": "663afb3d587353451e0c643",
	          "name": "JavaScript",
	          "category": "Web",
	          "proficiency": [
	            {
	              "rating": 4,
	              "date": 1448372082
	            }
	          ]
	        }
	      ],
	      "vacations": [
	        {
	          "start_date": "1235671235",
	          "end_date": "12357612365",
	          "location": "US",
	          "justification": "Need to refresh myself.",
	          "_id": "558afb3d5877117751e0c636"
	        }
	      ],
	      "role": "Admin"
	    }
	  ]
	}

**Case 2**: If the onVacation flag is set to true, then the response is
somewhat altered. Here is an example of the response for vacations
(status code 200):

	{
	  "kind": "resource#userListResponse",
	  "pageInfo": {
	    "totalResults": 2,
	    "resultsPerPage": 2
	  },
	  "items": [
	    {
	      "_id": "mcmohorn@us.ibm.com",
	      "fname": "Matthew",
	      "lname": "Mohorn",
	      "vacations": [
	        {
	          "start_date": "1235671235",
	          "end_date": "1235671235",
	          "location": "Canada",
	          "justification": "Need to refresh myself",
	          "contact_info": "mcmohorn@us.ibm.com"
	        },
	        {
	          "start_date": "1235671235",
	          "end_date": "1235671235",
	          "location": "UK",
	          "justification": "Need to refresh myself, again!",
	          "contact_info": "mcmohorn@us.ibm.com"
	        }
	      ]
	    },
	    {
	      "name": "Micah S. Brown",
	      "vacations": [
	        {
	          "start_date": "1235671235",
	          "end_date": "1235671235",
	          "location": "US",
	          "justification": "Need to refresh mysel!",
	          "contact_info": "brownsm@us.ibm.com"
	        }
	      ]
	    }
	  ]
	}

**Case 3**: if skill is present as a query parameter, the response is
altered. Only the relevant fields are returned (basic user info and
skills). For skills, only the skill requested is displayed and only the
most recent proficiency rating is included. Here is an example of the
response (status code 200):
```json
	{
	  "kind": "resource#userListResponse",
	  "pageInfo": {
	    "totalResults": 2
	  },
	  "items": [
	    {
	      "_id": "kccarr@us.ibm.com",
	      "fname": "KEVIN C.",
	      "lname": "CARR",
	      "email": "kccarr@us.ibm.com",
	      "role": "User",
	      "job_title": "Fulfillment Professional",
	      "cc": "us",
	      "skills": {
	        "id": "559d42ba389d33fc7c30d842",
	        "name": "AngularJS",
	        "category_id": "foo",
	        "proficiency": [
	          {
	            "rating": 3,
	            "date": "1235671235"
	          }
	        ]
	      }
	    },
	    {
	      "_id": "brownsm@us.ibm.com",
	      "fname": "Micah S.",
	      "lname": "Brown",
	      "role": "Admin",
	      "job_title": "Software Engineer Intern",
	      "cc": "us",
	      "skills": {
	        "name": "AngularJS",
	        "id": "559d42ba389d33fc7c30d842",
	        "category_id": "559d3aade4b041ee764b2f78",
	        "proficiency": [
	          {
	            "rating": 4,
	            "date": "1235671235"
	          }
	        ]
	      }
	    }
	  ]
	}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| badrequest (400)      		| badRequest | Parameters are in an incorrect format (i.e. limit is a string rather than an integer). |
| Unauthorized (401)      		| BadToken | Token is missing or invalid |
| Internal Server Error (500) | InternalError | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#8.Users: get details

Returns an individual user that matches the API request parameters.
Everyone has privilege to make this call.

##Request

### HTTP request

> GET /rest/v1/users/{id}

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value           | Required  | Description |
| ----------------------|-----------------| ----------|-------------|
| id      				 | string 		  | yes       | The id parameter specifies the id of the user you with to retrieve. The id is in the format of the user’s email address. It is caps insensitive (i.e. it treats lowercase and capital letters the same).|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure (status code 200):

	{
	  "kind": "resource#userResponse",
	  "pageInfo": {
	    "totalResults": 1
	  },
	  "item": {
	    "_id": "mfflemmi@us.ibm.com",
	    "_rev": "100-b662cfed533f634b5166bd3b460527fd",
	    "uid": "4G8715897",
	    "notesid": "Michelle F Flemming/Raleigh/IBM",
	    "employee_type": "P",
	    "cc": "us",
	    "fname": "MICHELLE F.",
	    "lname": "FLEMMING",
	    "email": "mfflemmi@us.ibm.com",
	    "cname": "MICHELLE F. FLEMMING",
	    "job_title": "Designer",
	    "status": "Active",
	    "role": "User",
	    "isManager": "False",
	    "vacations": [
	      {
	        "start_date": "1439409330",
	        "end_date": "1439409330",
	        "location": "US",
	        "justification": "Need to refresh myself."
	      }
	    ],
	    "skills": [
	      {
	        "id": "559d41bd5a0b5bcf7c94b363",
	        "name": "Node.JS",
	        "category_id": "559d41bd5a0b5bcf7c94b363",
	        "proficiency": [
	          {
	            "rating": 4,
	            "date": 1439409330
	          }
	        ]
	      },
	      {
	        "id": "559d42ba389d33fc7c30d842",
	        "name": "AngularJS",
	        "category_id": "559d41bd5a0b5bcf7c94b363",
	        "proficiency": [
	          {
	            "rating": 4,
	            "date": 1439409330
	          }
	        ]
	      }
	    ],
	    "num_projects": 2,
	    "dob": "1439409330",
	    "projects": [
	      {
	        "name": "Engage Support",
	        "status": "Active New Development",
	        "proj_id": "558da3ebe4b0cfb129e126b5",
	        "utilization": [
	          {
	            "start_date": "1439409330",
	            "end_date": "1439409330",
	            "percentage": 100
	          },
	          {
	            "start_date": "1439409330",
	            "end_date": "1439409330",
	            "percentage": 40
	          }
	        ]
	      },
	      {
	        "name": "Operational Dashboard",
	        "status": "Active New Development",
	        "proj_id": "558da434e4b0cfb129e126c6",
	        "utilization": [
	          {
	            "start_date": "1439409330",
	            "end_date": "1439409330",
	            "percentage": 60
	          }
	        ]
	      }
	    ]
	  }
	}

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| notFound (404)      			| userNotFound           |The user ID identified by the id parameter cannot be found. |
| Unauthorized (401)      		| BadToken               |Token is missing or invalid |
| Internal Server Error (500) | InternalError          |The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#9.Users: update

Update a user’s properties. Only the fields in the request body will be
updated. Those fields will be completely overwritten by what is present
in the request body. Admins may update any user. An individual user may
update his/her self. If skills are updated, then this call will update
the people\_count for each skill in the skills table.

##Request

### HTTP request

>PUT rest/v1/users/{id}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body. For that resource:

You must specify a value for the properties you wish to update. The
values that you indicate in the request body will overwrite the current
values in the user document indicated by id in the query parameter.

-   id: the ID of the request in the adopting application.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged. Note that if you want to update
“skills” or “projects”, only those fields will be updated.

	{
	  "employee_type": "Manager",
	  "vacations": [
	    {
	      "start_date": "1439409330",
	      "end_date": "1439409330",
	      "location": "US",
	      "justification": "Need to refresh myself.",
	      "contact_info": "brownsm@us.ibm.com"
	    }
	  ]
	}

##Response

No response is returned. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type        				| Error detail           | Description  |
| ------------------------------ |------------------------| -------------|
| badRequest (400)      			| validationError        | There is an error in the validation of the User model. Required values are not present in the update. |
| Unauthorized (401)      			| BadToken               | Token is missing or invalid|
| forbidden (403)      				| authorizationRequired  | The request is not properly authorized. |
| notFound (404)     				| userNotFound           | The request ID identified by the request's id parameter cannot be found. |
| Internal Server Error (500)		| InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```


#10.Users: insert

Add a user to the database. Everyone has privilege to make this call. If
skills are included in the body, then people\_count is updated for each
skill in the skills collection.

##Request

### HTTP request

>POST rest/v1/users/

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

There are no query parameters. See the Request body section for
requirements in the body.

### Request body

The request body contains the information about the user you are adding.
Many fields are populated through an LDAP connection to BluePages, based
on the user id provided. The fields that are ***required*** are:

-   “\_id” (this should be the user’s email IBM email address)

-   “employee\_type”

-   “job\_role”

-   “status”

-   “role”

If the optional “vacations” (array) field is present, then
“start\_date”, “end\_date”, “location”, justification”, and
“contact\_info” are all required for each object in the array.

If the optional “skills” (array) field present, then “id”, “name”,
“category”, and “rating” are all required for each object in the array.

If the optional “projects” (array) field is present, the “id”, “name”,
“status”, “utilization” (array), utilization:”start\_date”,
utilization:”end\_date”, utilization:”percentage” are all required for
each object in the array.

Here is an example request body:

	{
	  "_id": "brownsm@us.ibm.com",
	  "dob": "1990-09-24",
	  "employee_type": "Regular",
	  "job_role": "Intern",
	  "isManager": "No",
	  "status": "Active",
	  "role": "User",
	  "vacations": [],
	  "skills": []
	}

##Response

If successful, this method returns an HTTP 201 response code. The
location header is set to the URL of the newly created user.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail      | Description  |
| --------------------------- |-------------------| -------------|
| badrequest (400)      		| badRequest        | A user already exists in database with that id. |
| Unauthorized (401)      		| BadToken          | Token is missing or invalid. |
| notFound (404)      			| requestNotFound   | The user with id userID can not be found in BluePages. |
| Internal Server Error (500) | InternalError     | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#11.Users: delete

Delete a user. Only an Admin has privilege to delete a user. If the user
that is being deleted has skills, then this call also updates the
people\_count for each skill in the skills collection.

##Request

### HTTP request

>DELETE rest/v1/users/{id}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Parameters

The table below lists the parameters that this query supports.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  id     				 | string			   | Yes  | The id parameter specifies the id of the user you with to delete. The id is in the format of the user’s email address. It is caps insensitive (i.e. it treats lowercase and capital letters the same).|

### Request body

Do not provide a request body when calling this method.

##Response

No response is returned. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| forbidden (403)      			| authorizationRequired  | The request is not properly authorized (only admin may delete a user profile).|
| notFound (404)      			| userNotFound        | The user ID identified by the request's id parameter cannot be found. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#12.Skill: get list

Returns a list of skills that match the API request parameters.

##Request


### HTTP request

> GET /rest/v1/skills?limit={limit}&offset={offset}&category={category}&parts=({parts})

Or

> GET /rest/v1/skills?view=list

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  limit     				 | unsigned integer | No  | The limit parameter specifies the maximum number of items that should be returned in the result set.|
|  offset     			 | unsinged integer | No | The offset parameter specifies from which index value the items should be returned|
|  category(optional)   | string 			   | No | The category parameter specifies a category ID for the resource(s) that are being retrieved.If a category ID is specified, the api returns all the skills(s) where the skills belong to specified category ID. If not specified, api returns all the skills(s) irrespective of the category ID.|
|  parts    				 | string 		  | No | The **parts** parameter specifies a comma-separated list of one or more request resource properties that the API response will include.If **parts** is omitted, API response includes all the properties of the resource document.|
|  view    				 | string 		  | No | If the view parameter is specified as “list”, the API response contains all the categories, the skills that fall in each category and people who know each skill.|
|  manager    				 | string 		  | No | If this parameter is specified, the response will contain all documents which is owned by the manager parameter. This parameter will be defaulted to “all” if not specified in the URL.|


### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure. Status code = 200.

**Case 1** : If view parameter is not specified in the url

/rest/v1/skills?manager=all

```
{
  "kind": "Resource#SkillsList",
  "items": [
    {
      "_id": "0b95e098d9586aeab0dbe2d7f2594ecc",
      "name": "Leadership",
      "category": "Project Management",
      "category_id": "0b95e098d9586aeab0dbe2d7f222a815"
    },
    {
      "_id": "0eda638033baf10da8f8cfbd0910fbe4",
      "name": "DB2",
      "category": "Databases",
      "category_id": "62ce0e30c99b64abf461cd77bf764a45"
    },
…
    {
      "_id": "bf5530987cbcb05ccb10af4029541e11",
      "name": "J2EE",
      "category": "Back-end Development",
      "category_id": "e2b6195229dc79dad1423792a41363ca"
    }
  ]
}
```

**Case 2** : If view parameter is specified in the url

/rest/v1/skills?view=list&manager=all

```
{
  "kind": "Resource#SkillsList",
  "items": {
    "0b95e098d9586aeab0dbe2d7f222a815": {
      "name": "Project Management",
      "skills": {
        "0b95e098d9586aeab0dbe2d7f24f6798": {
          "name": "Business Process",
          "description": "Have knowledge of Business Processes",
          "trending": false,
          "count": 25
        },
        "0b95e098d9586aeab0dbe2d7f2532cd9": {
          "name": "Adaptability",
          "description": "Adaptability",
          "trending": false,
          "count": 28
        },
…
        "e969a12fcd80f2d6c67c3c454bb7b962": {
          "name": "JPA",
          "description": "The Java Persistence API (JPA) is a Java specification for accessing, persisting, and managing data between Java objects / classes and a relational database. JPA was defined as part of the EJB 3.0 specification as a replacement for the EJB 2 CMP Entity Beans specification.",
          "trending": false,
          "count": 7
        }
      },
      "total_count": 54
    }
  }
}

```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400)      		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| notFound (404)      			| requestNotFound        | The user ID identified by the request's id parameter cannot be found. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#13.Skills: Update

Update a skill’s properties.

##Request

### HTTP request

>PUT rest/v1/admin/skills/{skillId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  skillId     			 | string			   | Yes       | The skillId parameter specifies skill ID for the resource that is being updated. In a Skill resource, the skillId property specifies the skill’s ID in Skills resource document.|

### Request body

Provide a skill resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

```
{
  "name": "Java",
  "description": "Java is a general purpose computer programming language that is concurrent, class-based, object-oriented, and specifically designed to have as few implementation dependencies as possible. It is intended to let application developers write once, run anywhere (WORA), meaning that compiled Java code can run on all platforms that support Java without the need for recompilation.",
  "category_id": "559d3aade4b041ee764b2f78"
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| forbidden (403)      			| authorizationRequired  | This error message is thrown if the user is trying to access a resource which he/she is not authorized|
| notFound (404)      			| Skill not found        | The skill ID identified by the request's skillId parameter cannot be found. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Credentials"
}
```

#14.Skills: get details

Returns skill details based on the skill ID specified.

##Request

### HTTP request

>GET rest/v1/skills/{skillId}?relatedSkills=true

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  relatedSkills (optional) | string			   | No       | If the relatedSkills parameter is set to true, the response body includes all the related skills of the skill ID specified in the request url.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

	{
	  "kind": "Resource#SkillDetails",
	  "item": {
	    "_id": "559d481b389d33fc7c30d847",
	    "name": "Java",
	    "description": "Java is a general purpose  programming language that is concurrent, class-based, object-oriented, and specifically designed to have as few implementation dependencies as possible. It is intended to let application developers write once, run anywhere (WORA), meaning that compiled Java code can run on all platforms that support Java without the need for recompilation.",
	    "category_id": "559d3aade4b041ee764b2f78",
	    "category": "Web Development",
	    "people_count": 3,
	    "relatedSkills": [
	      {
	        "skill_id": "559d42ba389d33fc7c30d842",
	        "name": "AngularJS"
	      },
	      {
	        "skill_id": "559d41bd5a0b5bcf7c94b363",
	        "name": "Node.JS"
	      }
	    ]
	  }
	}

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400)      		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| notFound (404)      			| Skill not found        | The skill ID identified by the request's skillId parameter cannot be found. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#15.Skills: add

This api is for creating a new skill.

##Request

### HTTP request

>POST rest/v1/admin/skills

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

	{
	  "name": "Java",
	  "description": "Java is a general-purpose computer programming language that is concurrent, class-based, object-oriented, and specifically designed to have as few implementation dependencies as possible. It is intended to let application developers write once, run anywhere (WORA), meaning that compiled Java code can run on all platforms that support Java without the need for recompilation.",
	  "category_id": "559d3aade4b041ee764b2f78"
	}

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400)      		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| forbidden (403) 	     		| Not Authorized         | The request is not properly authorized.|
| notFound (404)      			| Category not found     | This error is expected when cateogry id of the skill specified does not exist |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#16.Skills: delete

Deletes a skill. Only admin is authorized to delete the skill.

##Request

### HTTP request

>DELETE /rest/v1/admin/skills/{skillId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  skillId				 | string		   	   | Yes       | The skillId parameter specifies skill ID for the resource that is being deleted. In a skill resource, the skillID property specifies the skill’s ID in skills resource document.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| forbidden (403) 	     		| Not Authorized         | The request is not properly authorized.|
| notFound (404)      			| Skill not found        | The skill ID identified by the request's skillId parameter cannot be found. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#17.Search: get list

Returns a list of projects and users that match the API request
parameters.

##Request

### HTTP request

> GET /rest/v1/search?parts=(projects,users)

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  parts(optional)		 | string		   	   | No        | The **parts** parameter specifies a comma-separated list of one or more request resource properties that the API response will include. If **parts** is omitted, API response includes projects,users,skills|
|  manager			    | string		   	   | Yes        | The **manager** parameter specifies the manager email id. If manager email id is mentioned in the url, all the projects,users and skills related to that manager will be searched based on given query|
|  query					 | string		   	   | Yes        | The **query** parameter specifies the string to be searched for in the database to retrieve projects,skills and users|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure. Status code = 200.

Ex : /rest/v1/search?parts=(projects,users,skills)&manager=all&query=spar

```
{
  "kind": "Resource#SearchList",
  "items": {
    "users": [
      {
        "reports_to": "jlsteele@us.ibm.com",
        "email": "orios@us.ibm.com",
        "fname": "Rios",
        "lname": "Oscar"
      }
    ],
    "projects": [
      {
        "proj_id": "ffe726494931a7624845637dde4ee7e4",
        "name": "SAR"
      },
      {
        "proj_id": "9007D1EC304258DD85257EC30047CBFD",
        "name": "DSW SAP"
      },
      {
        "proj_id": "11ab269168b2d938ec70be8729fac398",
        "name": "Engage Support - IPAD"
      },
      {
        "proj_id": "ed3e2a1b0968262b5e7d69b9f92b78e6",
        "name": "Auto-Warranty Start (AWS) 2.0"
      },
      {
        "proj_id": "4667670FCC07F9EA07257EBC00094DD7",
        "name": "EngageSUPPORT",
        "description": "To provide a unique, integrated space to collaborate and engage with all the parties in order to receive and offer support throughout the pre-sales and post-sales processes. \nWe are: Enterprise Services\nA team of highly skilled professionals who are partnering with Sellers and other Aligned Functions to deliver high-quality client service support.\nWhy EngageSupport?\nTo collaborate and engage with all parties in a unique, integrated space to receive and offer support throughout the pre-sales and post-sales processes."
      }
    ],
    "skills": [
      {
        "name": "Spark",
        "description": "Apache Spark",
        "skill_id": "7be7b70298caec1bc98e2847a6a8f15f",
        "category": "Databases"
      },
      {
        "name": "JPA",
        "description": "The Java Persistence API (JPA) is a Java specification for accessing, persisting, and managing data between Java objects / classes and a relational database. JPA was defined as part of the EJB 3.0 specification as a replacement for the EJB 2 CMP Entity Beans specification.",
        "skill_id": "e969a12fcd80f2d6c67c3c454bb7b962",
        "category": "Back-end Development"
      },
      {
        "name": "Spring MVC",
        "description": "Spring MVC, a part of the core Spring Framework, is a mature and capable action-response style web framework, with a wide range of capabilities and options aimed at handling a variety of UI-focused and non-UI-focused web tier use cases.",
        "skill_id": "e969a12fcd80f2d6c67c3c454bb76340",
        "category": "Back-end Development"
      }
    ]
  }
}
```


##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400) 	     		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#18.Dropdown: get list

Returns a list of dropdown data that match the API request parameters.

##Request

### HTTP request

> GET /rest/v1/dropdown?filter=dropdownName

dropdownName can be either projectgeo, projectstatus, projectprocess,
roles, employeestatus, employeetype or jobroles

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  filter		    		 | string		   	   | Yes        | The **filter** parameter specifies a dropdown name that the API response will include.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure. Status code = 200.

Ex : /rest/v1/search?filter=projectgeo

```
{
  "kind": "Resource#ProjectGeoList",
  "items": [
    {
      "_id": "a09e73172d430867c1db16d0c265dc77",
      "_rev": "1-f177c2a94e1cb5c93f13966ad80ab7ff",
      "name": "World Wide"
    },
    {
      "_id": "c653ee72c18c6792e78e5b86d640def7",
      "_rev": "1-eff881123fc75fcc58e34ff9a0e4ed89",
      "name": "americas"
    }
  ]
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400) 	     		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#19.Newsfeeds: get list

Returns a list of newsfeeds that match the API request parameters.

##Request

### HTTP request

> GET /rest/v1/newsfeeds?limit={limit}&offset={offset}&date={timestamp}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  limit		    		 | string		   	   | No        | The limit parameter specifies the maximum number of items that should be returned in the result set.|
|  offset		    		 | string		   	   | No        | The offset parameter specifies from which index value the items should be returned|
|  date(optional)		 | string		   	   | No        | If the date parameter is specified in the url, then the response includes only the newsfeeds where the date falls in between start\_date and end\_date of the newsfeed.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure. Status code = 200.

**Case 1** : If the date parameter is specified in the URL.

Ex : /rest/v1/newsfeeds?limit=5&offset=0&date=1439487200000

```
{
  "kind": "Resource#NewsFeedList",
  "items": [
    {
      "_id": "3fd3e3fad1755982760c4342e2f5caf6",
      "_rev": "2-f6b3a75d1b0343924014153d384f7213",
      "content": "Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
      "start_date": 1434216800000,
      "end_date": 1450028000000,
      "created_by": "hyayi@us.ibm.com",
      "created_date": 1439613201906
    },
    {
      "_id": "1e00d4f43287bf3808537d55215f1a14",
      "_rev": "8-c8bff5e0c2cd8a485e9f80d68cab7f50",
      "content": "Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
      "start_date": 1431538400000,
      "end_date": 1450028000000,
      "created_by": "hyayi@us.ibm.com",
      "created_date": 1439564790549,
      "modified_by": "hyayi@us.ibm.com",
      "modified_date": 1439566069156
    }
  ]
}
```

**Case 2** : If the date parameter is not specified in the URL.

Ex : /rest/v1/newsfeeds?limit=3&offset=0

```
{
  "kind": "Resource#NewsFeedList",
  "pageInfo": {
    "totalResults": 3,
    "resultsPerPage": "3"
  },
  "items": [
    {
      "_id": "3fd3e3fad1755982760c4342e2f5caf6",
      "_rev": "2-f6b3a75d1b0343924014153d384f7213",
      "content": "Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
      "start_date": 1434216800000,
      "end_date": 1450028000000,
      "created_by": "hyayi@us.ibm.com",
      "created_date": 1439613201906
    },
    {
      "_id": "1e00d4f43287bf3808537d55215f1a14",
      "_rev": "8-c8bff5e0c2cd8a485e9f80d68cab7f50",
      "content": "Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
      "start_date": 1431538400000,
      "end_date": 1450028000000,
      "created_by": "hyayi@us.ibm.com",
      "created_date": 1439564790549,
      "modified_by": "hyayi@us.ibm.com",
      "modified_date": 1439566069156
    },
    {
      "_id": "9a6ffce88c28185705635229a5212cd4",
      "_rev": "4-5c19ce115cfa1cc86dbd81064bda70fa",
      "content": "Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
      "start_date": 1434216800000,
      "end_date": 1450028000000,
      "created_by": "hyayi@us.ibm.com",
      "created_date": 1439613107637
    }
  ]
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400) 	     		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#20.Newsfeed: Update

Update a newsfeed’s properties. Only Admin is authorized to do this.

##Request

### HTTP request

>PUT rest/v1/admin/newsfeeds/{newsfeedId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  newsfeedID		    		 | string		   	   | Yes        | The newsfeedID parameter specifies newsfeed ID for the resource that is being updated. In a newsfeed resource, the newsfeedID property specifies the newsfeed’s ID in newsfeed resource document.|

### Request body

Provide a newsfeed resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

	{
	  "content": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique."
	}

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| badrequest (400) 	     		| badrequest             | This error is expected, if a invalid parameter is passed in the url.|
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| Forbidden (403)			   | Not authorized          | This error message is thrown if the user is trying to access a resource which he/she is not authorized. Only Admin can update the newsfeed. |
| notFound (404) 				| Newsfeed not found      | The newsfeed ID identified by the request's newsfeedId parameter cannot be found. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#21.Newsfeed: get details

Returns newsfeed details based on the newsfeed ID specified.

##Request

### HTTP request

>GET rest/v1/newsfeeds/{newsfeedId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

```
{
  "kind": "Resource#NewsFeed",
  "item": {
    "_id": "1e00d4f43287bf3808537d55215f1a14",
    "_rev": "8-c8bff5e0c2cd8a485e9f80d68cab7f50",
    "content": "Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
    "start_date": 1431538400000,
    "end_date": 1450028000000,
    "created_by": "hyayi@us.ibm.com",
    "created_date": 1439564790549,
    "modified_by": "hyayi@us.ibm.com",
    "modified_date": 1439566069156
  }
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| notFound (404) 				| Newsfeed not found      | The newsfeed ID identified by the request's newsfeedId parameter cannot be found. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#22.Newsfeed: add

This api is for creating a new newsfeed. Only Admin is authorized to
do this.

##Request

### HTTP request

>POST rest/v1/admin/newsfeeds

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

```
{
  "content": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique.",
  "start_date": "1434216800000",
  "end_date": "1450028000000"
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.


| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| badrequest (400) 				| badrequest             | This error is expected, if JSON document provided in the request body does not have mandatory parameters . |
| forbidden (403) 				| Not Authorized         | The request is not properly authorized. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#23.Newsfeed: delete

Deletes a newsfeed. Only admin is authorized to delete the newsfeed.

##Request

### HTTP request

>DELETE /rest/v1/admin/newsfeeds/{newsfeedId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  newsfeedID		    		 | string		   	   | Yes        | The newsfeedID parameter specifies newsfeed ID for the resource that is to be deleted. In a newsfeed resource, the newsfeedID property specifies the newsfeed’s ID in newsfeed resource document.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| notFound (404) 				| newsfeed not found     | The newsfeed ID identified by the request's newsfeedId parameter cannot be found. |
| forbidden (403) 				| Not Authorized         | The request is not properly authorized. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#24.ProjectStatus: get details

Returns projectstatus details based on the projectstatus ID specified.
Only Admin is authorized to do this.

##Request

### HTTP request

>GET rest/v1/admin/projectstatus/{projectStatusId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

```
{
  "kind": "Resource#ProjectStatusDetails",
  "item": {
    "_id": "d5162523d9e74a36243a40210a1baed6",
    "_rev": "1-0a1c22ec1075d1ac6ac6b3338db6fa0e",
    "name": "Active New Development",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris",
    "created_by": "hyayi@us.ibm.com",
    "created_date": "1434216800000"
  }
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| notFound (404) 				| Project status not found | The project status with id projectStatusId cannot be found. |
| forbidden (403) 				| Not Authorized         | The request is not properly authorized. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#25.ProjectStatus: add

This api is for creating a new project status. Only Admin is
authorized to do this.

##Request

### HTTP request

>POST rest/v1/admin/projectstatus

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

```
{
  "name": "Active New Development",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| badrequest (400) 				| badrequest | This error is expected, if JSON document provided in the request body does not have mandatory parameters . |
| forbidden (403) 				| Not Authorized         | The request is not properly authorized. |


Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#26.ProjectStatus: Update

Update a projectstatus properties. Only Admin is authorized to do this.

##Request

### HTTP request

>PUT rest/v1/admin/projectstatus/{projectStatusId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|  projectStatusId		    		 | string		   	   | Yes        | The projectStatusId parameter specifies projectstatus ID for the resource that is being updated. In a projectstatus resource, the projectStatusId property specifies the projectstatus’s ID in projectstatus resource document.|


### Request body

Provide a projectstatus resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

```
{
  "description": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui,pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo,nostrum leo vel arcu, tortor eu vulputate tristique."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
| Unauthorized (401)      		| BadToken               | Token is missing or invalid. |
| Internal Server Error (500) | InternalError          | The server encountered an unexpected condition that prevented it from fulfilling the request. |
| badrequest (400) 				| badrequest | This error is expected, if JSON document provided in the request body does not have mandatory parameters . |
| forbidden (403) 				| Not Authorized         | The request is not properly authorized. Only Admin can update the projectstatus resource.|
|notFound (404)               |Projectstatus not found |  The projectstatus ID identified by the request's projectStatusId parameter cannot be found.|  

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#27.ProjectStatus: delete

Deletes a project status. Only admin is authorized to delete the project
status.

##Request

### HTTP request

>DELETE /rest/v1/admin/projectstatus/{projectStatusId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|projectStatusId   		 |string			   |   Yes     |  The projectStatusId parameter specifies projectstatus ID for the resource that is being updated. In a project status resource, the projectStatusId property specifies the project status ID in project status resource document.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail           | Description  |
| --------------------------- |------------------------| -------------|
|  notFound (404)             |   Project Status not found  | The projectstatus ID identified by the request's projectStatusId parameter cannot be found. |
|  forbidden (403)            |   Not Authorized       |The request is not properly authorized.|
|  Unauthorized (401)         |   BadToken             |Token is missing or invalid |
|Internal Server Error (500)  | InternalError           |The server encountered an unexpected condition which prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#28.ProjectProcess: get details

Returns projectprocess details based on the projectprocess ID specified.
Only Admin is authorized to do this.

##Request

### HTTP request

>GET rest/v1/admin/projectprocess/{projectProcessId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

```
{
  "kind": "Resource#ProjectProcessDetails",
  "item": {
    "_id": "d5162523d9e74a36243a40210a1baed6",
    "_rev": "1-0a1c22ec1075d1ac6ac6b3338db6fa0e",
    "name": "Service",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris",
    "created_by": "hyayi@us.ibm.com",
    "created_date": "1434216800000"
  }
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             | Project process not found |The project status with id projectProcessId cannot be found. |
|Internal Server Error (500)  |InternalError              |The server encountered an unexpected condition which prevented it from fulfilling the request.|
|Unauthorized (401)           |BadToken                   |Token is missing or invalid|
|forbidden (403)              |Not Authorized             |The request is not properly authorized.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#29.ProjectProcess: add

This api is for creating a new project process. Only Admin is
authorized to do this.

##Request

### HTTP request

>POST rest/v1/admin/projectprocess

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

```
{
  "name": "Service",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.


| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  Internal Server Error (500)| InternalError             |The server encountered an unexpected condition which prevented it from fulfilling the request.|
|forbidden (403)              |Not Authorized             |The request is not properly authorized.|
|Unauthorized (401)           |BadToken                   |Token is missing or invalid|
|badrequest (400)             |badrequest                 |This error is expected, if JSON document provided in the request body does not have mandatory parameters .|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#30.ProjectProcess: Update

Update a projectprocess properties. Only Admin is authorized to do this.

#Request

### HTTP request

>PUT rest/v1/admin/projectprocess/{projectProcessId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

| Parameter name        | Value            | Required  | Description |
| --------------------- |------------------| ----------|-------------|
|projectProcessId       |string   		   |Yes        |The projectProcessId parameter specifies projectprocess ID for the resource that is being updated. In a projectprocess resource, the projectProcessId property specifies the projectprocess’s ID in projectprocess resource document.|

### Request body

Provide a projectprocess resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

```
{
  "description": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|notFound (404)               |ProjectProcess not found   |The projectprocess ID identified by the request's projectProcessId parameter cannot be found.|
|Forbidden (403)              |Not authorized             |This error message is thrown if the user is trying to access a resource which he/she is not authorized. Only Admin can update the projectprocess resource.|
|Internal Server Error (500)  |InternalError              |The server encountered an unexpected condition which prevented it from fulfilling the request.|
|Unauthorized (401)            |BadToken                   |Token is missing or invalid|
|badrequest (400)              |badrequest                 |This error is expected, if the JSON document supplied in the body does not have mandatory parameters.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#31.ProjectProcess: delete

Deletes a project process. Only admin is authorized to delete the
project process.

##Request

### HTTP request

>DELETE /rest/v1/admin/projectprocess/{projectProcessId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

|Paramerer name     |Value    |Required   |Description|
| ----------------- |---------| ----------|-------------|
|projectProcessId   |string   |Yes        |The projectProcessId parameter specifies projectprocess ID for the resource that is being updated. In a project process resource, the projectProcessId property specifies the project process ID in project process resource document.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|notFound (404)               |Project Process not found  |The projectprocess ID identified by the request's projectProcessId parameter cannot be found.|
|forbidden (403)              |Not Authorized             |The request is not properly authorized.|
|Unauthorized (401)           |BadToken                   |Token is missing or invalid.|
|Internal Server Error (500)  |InternalError              |The server encountered an unexpected condition which prevented it from fulfilling the request.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#32.ProjectGeo: get details

Returns projectgeo details based on the projectgeo ID specified. Only
Admin is authorized to do this.

#Request

### HTTP request

>GET rest/v1/admin/projectgeo/{projectGeoId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

```
{
  "kind": "Resource#ProjectGeoDetails",
  "item": {
    "_id": "d5162523d9e74a36243a40210a1baed6",
    "_rev": "1-0a1c22ec1075d1ac6ac6b3338db6fa0e",
    "name": "America",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris",
    "created_by": "hyayi@us.ibm.com",
    "created_date": "1434216800000"
  }
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
| notFound (404)              | Project geo not found     | The project status with id projectGeoId cannot be found. |
| Internal Server Error (500) | InternalError             | The server encountered an unexpected condition which prevented it from fulfilling the request. |
| Unauthorized (401)          | BadToken                  | Token is missing or invalid |
| forbidden (403)             | Not Authorized            | The request is not properly authorized.

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#33.ProjectGeo: add

This api is for creating a new project geo. Only Admin is authorized
to do this.

##Request

### HTTP request

>POST rest/v1/admin/projectgeo

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

```
{
  "name": "America",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris"
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  Internal Server Error (500)|   InternalError           | The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  forbidden (403)            |   Not Authorized          | The request is not properly authorized. |
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid. |
| badrequest (400)            |  badrequest               |   This error is expected, if JSON document provided in the request body does not have mandatory parameters . |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#34.ProjectGeo: Update

Update a projectgeo properties. Only Admin is authorized to do this.

##Request

### HTTP request

>PUT rest/v1/admin/projectgeo/{projectGeoId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

|Paramerer name     |Value    |Required   |Description|
| ----------------- |---------| ----------|-------------|
|  projectGeoId     |string   |Yes        |The projectGeoId parameter specifies projectgeo ID for the resource that is being updated. In a projectgeo resource, the projectGeoId property specifies the projectgeo’s ID in projectgeo resource document. |

### Request body

Provide a projectgeo resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

```
{
  "description": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo,nostrum leo vel arcu, tortor eu vulputate tristique."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   ProjectGeo not found    |  The projectgeo ID identified by the request's projectGeoId parameter cannot be found.|
| Forbidden (403)             |  Not authorized           |  This error message is thrown if the user is trying to access a resource which he/she is not authorized. Only Admin can update the projectgeo resource. |
|  Internal Server Error (500) |  InternalError           |  The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid |
|  badrequest (400)           |   badrequest              | This error is expected, if the JSON document supplied in the body does not have mandatory parameters. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#35.ProjectGeo: delete

Deletes a project geo. Only admin is authorized to delete the project
geo.

##Request

### HTTP request

>DELETE /rest/v1/admin/projectgeo/{projectGeoId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

|Paramerer name    |Value   |Required     |Description|
| ----------------- |---------| ----------|-------------|
|  projectGeoId     | string  | Yes       | The projectGeoId parameter specifies projectgeo ID for the resource that is being updated. In a project geo resource, the projectGeoId property specifies the project geo ID in project geo resource document. |

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |  Project Geo not found    |The project geo ID identified by the request's projectGeoId parameter cannot be found. |
|  forbidden (403)            |   Not Authorized          |The request is not properly authorized.|
|  Unauthorized (401)         |   BadToken                |Token is missing or invalid. |
| Internal Server Error (500) |  InternalError            |The server encountered an unexpected condition which prevented it from fulfilling the request.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#36.JobRoles: get details

Returns job role details based on the jobrole ID specified. Only Admin
is authorized to do this.

##Request

### HTTP request

>GET rest/v1/admin/jobroles/{jobRoleId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

```
{
  "kind": "Resource#JobRoleDetails",
  "item": {
    "_id": "d5162523d9e74a36243a40210a1baed6",
    "_rev": "1-0a1c22ec1075d1ac6ac6b3338db6fa0e",
    "name": "Architect",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris",
    "created_by": "hyayi@us.ibm.com",
    "created_date": "1434216800000"
  }
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   Job role not found      | The project status with id jobRoleId cannot be found. |
|  Internal Server Error (500)|   InternalError           |   The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid. |
|  forbidden (403)            |   Not Authorized          |    The request is not properly authorized. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

##37.JobRoles: add

This api is for creating a new job role. Only Admin is authorized to
do this.

##Request

### HTTP request

>POST rest/v1/admin/jobroles

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

```
{
  "name": "Architect",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris"
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  Internal Server Error (500)|   InternalError           |   The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  forbidden (403)            |   Not Authorized          |  The request is not properly authorized. |
|  Unauthorized (401)         |    BadToken               |    Token is missing or invalid. |
|  badrequest (400)           |   badrequest              |    This error is expected, if JSON document provided in the request body does not have mandatory parameters . |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#38.JobRoles: Update

Update a jobrole properties. Only Admin is authorized to do this.

##Request

### HTTP request

>PUT rest/v1/admin/jobroles/{jobRoleId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

|Paramerer name    |Value   |Required     |Description|
| -----------------|---------| ----------|-------------|
|  jobRoleId       | string  | Yes       | The jobRoleId parameter specifies jobrole ID for the resource that is being updated. In a jobrole resource, the jobRoleId property specifies the jobrole’s ID in jobroles resource document. |

### Request body

Provide a jobrole resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

```
{
  "description": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   JobRole not found       |  The jobrole ID identified by the request's jobRoleId parameter cannot be found. |
|  Forbidden (403)            |   Not authorized          | This error message is thrown if the user is trying to access a resource which he/she is not authorized. Only Admin can update the jobrole resource. |
|  Internal Server Error (500)|   InternalError           | The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  Unauthorized (401)         |   BadToken                |   Token is missing or invalid. |
|  badrequest (400)           |   badrequest              |  This error is expected, if the JSON document supplied in the body does not have mandatory parameters. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#39.JobRoles: delete

Deletes a job role. Only admin is authorized to delete the job role.

##Request

### HTTP request

>DELETE /rest/v1/admin/jobroles/{jobRoleId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

|Paramerer name    |Value   |Required     |Description|
| -----------------|---------| ----------|-------------|
|  jobRoleId       | string  | Yes       | The jobRoleId parameter specifies job role ID for the resource that is being updated. In a job role resource, the jobRoleId property specifies the job role ID in jobroles resource document. |

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   Job role not found      |  The job role ID identified by the request's jobRoleId parameter cannot be found. |
|  forbidden (403)            |   Not Authorized          |   The request is not properly authorized. |
|  Unauthorized (401)         |   BadToken                |  Token is missing or invalid. |
|  Internal Server Error (500)|   InternalError           | The server encountered an unexpected condition which prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#40.Categories: get details

Returns Category details based on the category ID specified. Only Admin
is authorized to do this.

##Request

### HTTP request

>GET rest/v1/admin/categories/{categoryId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns details of the skill in its response
body. Below is the sample format of the response body. Status code =
200.

```
{
  "kind": "Resource#CategoryDetails",
  "item": {
    "_id": "d5162523d9e74a36243a40210a1baed6",
    "_rev": "1-0a1c22ec1075d1ac6ac6b3338db6fa0e",
    "name": "Databases",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris",
    "created_by": "hyayi@us.ibm.com",
    "created_date": "1434216800000"
  }
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   Category not found      | The project status with id categoryId cannot be found. |
| Internal Server Error (500) |  InternalError            |  The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid |
  forbidden (403)             |  Not Authorized           | The request is not properly authorized. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#41.Categories: add

This method is for creating a new Category. Only Admin is authorized to
do this.

##Request

### HTTP request

>POST rest/v1/admin/categories

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Request body

Provide a request resource in the request body.

```
{
  "name": "Web Development",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis pharetra tristique blandit. Phasellus posuere justo vel nibh auctor dapibus. Maecenas dapibus ipsum rhoncus, fringilla diam ut, posuere mauris"
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 201 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 201.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  Internal Server Error (500)|   InternalError           |   The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  forbidden (403)            |   Not Authorized          | The request is not properly authorized.
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid. |
|  badrequest (400)           |   badrequest              | This error is expected, if JSON document provided in the request body does not have mandatory parameters. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#42.Categories: Update

Update a category properties. Only Admin is authorized to do this.

##Request

### HTTP request

>PUT rest/v1/admin/categories/{categoryId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

|Paramerer name    |Value   |Required     |Description|
| -----------------|---------| ----------|-------------|
|  categoryId      | string  | Yes       | The categoryId parameter specifies category ID for the resource that is being updated. In a category resource, the categoryId property specifies the category’s ID in categories resource document.|

### Request body

Provide a category resource in the request body.

If you are submitting an update request, and your request does not
specify a value for a property that already has a value, the property's
existing value will be unchanged.

```
{
  "description": " Lorem ipsum dolor sit amet, metus nec ut, duis lorem nisl viverra blandit magna, vitae nec nulla maecenas odio ante dui, pretium pellentesque, quis dui quis ultricies litora. Libero sed mus, pede amet sit suscipit, felis hendrerit mi mauris ullamcorper justo, nostrum leo vel arcu, tortor eu vulputate tristique."
}
```

##Response

If successful, this method returns a request resource in the response
body a [*HTTP 204 status
code*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.6) and
include a [*Location
header*](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30)
that points to the URL of the new resource. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   Category not found      |The category ID identified by the request's categoryId parameter cannot be found.
|  Forbidden (403)            |   Not authorized          |This error message is thrown if the user is trying to access a resource which he/she is not authorized. Only Admin can update the category resource.|
|  Internal Server Error (500)|   InternalError           |The server encountered an unexpected condition which prevented it from fulfilling the request.|
|  Unauthorized (401)         |   BadToken                |Token is missing or invalid.|
|  badrequest (400)           |   badrequest              |This error is expected, if the JSON document supplied in the body does not have mandatory parameters.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#43.Categories: delete

Deletes a Category. Only admin is authorized to delete the Category.
This API deletes a category in Category database and also deletes the
skills related to that category in Skills database and removes the skill
entries in the Users database.

##Request

### HTTP request

>DELETE /rest/v1/admin/categories/{categoryId}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

|Paramerer name    |Value   |Required     |Description|
| -----------------|---------| ----------|-------------|
|  categoryId      | string  | Yes       | The categoryId parameter specifies category ID for the resource that is being updated. In a category resource, the categoryId property specifies the category ID in categories resource document.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method does not return anything in the response
body. Status code = 204.

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  notFound (404)             |   Category not found      | The category ID identified by the request's categoryId parameter cannot be found. |
|  forbidden (403)            |   Not Authorized          | The request is not properly authorized.
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid
| Internal Server Error (500) |  InternalError            | The server encountered an unexpected condition which prevented it from fulfilling the request. |

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#44.Categories: get list

Returns a list of categories that match the API request parameters.

##Request

### HTTP request

> GET /rest/v1/admin/categories?limit={limit}&offset={offset}

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Parameters

The table below lists the parameters that this query supports. All of
the parameters listed are query parameters.

|Paramerer name    |Value   |Required     |Description|
| -----------------|-------------------| ----------|-------------|
|  limit           | unsigned integer  | No        | The limit parameter specifies the maximum number of items that should be returned in the result set.
|  offset          | unsigned integer  | No        | The offset parameter specifies from which index value the items should be returned.|

### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns a response body with the following
structure. Status code = 200.

```
{
  "kind": "Resource#CategoriesList",
  "items": [
    {
      "_id": "62ce0e30c99b64abf461cd77bf764ea4",
      "_rev": "1-e74074115e08a1f9bfefbdf3b08a1032",
      "name": "Web Development"
    },
    {
      "_id": "62ce0e30c99b64abf461cd77bf764a45",
      "_rev": "1-6e5e2fb8492e3bb55f56bd3232a25007",
      "name": "Databases"
    }
  ]
}
```

##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  Internal Server Error (500)|   InternalError           |   The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  badrequest (400)           |   badrequest              |    This error is expected, if a invalid parameter is passed in the url. |
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid. |
|  forbidden (403)            |   Not Authorized          | The request is not properly authorized.|

Sample error response

```
{
  "error_code": 401,
  "message": "Invalid Token or Key"
}
```

#44.Utilizations: validate

Validates a user's utilizations.

##Request

### HTTP request

> GET /rest/v1/user/:userId/validateUtilization

Token generated after login should be put in the request header in order
to call the api, the following is the field which needs to be set in the
request header ‘x-access-token’

#### Path Parameters

The table below lists the parameters that this path supports.

|Paramerer name    |Value   |Required     |Description|
| -----------------|-------------------| ----------|-------------|
|  userId           | String  | Yes        | The id of the user who is validating their utilizations.


### Request body

Do not provide a request body when calling this method.

##Response

If successful, this method returns no body with the following
structure. Status code = 200.



##Errors

The table below identifies error messages that the API could return in
response to a call to this method.

| Error type	        			| Error detail              | Description  |
| --------------------------- |---------------------------| -------------|
|  Internal Server Error (500)|   InternalError           |   The server encountered an unexpected condition which prevented it from fulfilling the request. |
|  Internal Server Error (500)           |   Internal Server Error              |    An error occured while accessing the database. |
|  Unauthorized (401)         |   BadToken                | Token is missing or invalid. |
|  forbidden (403)            |   Not Authorized          | The request is not properly authorized.|
| Not Found (404) | Not Found | The user's utilization could not be located.

Sample error response

```
{
  "error_code": 404,
  "message": 'Could not locate Utilization document for user [bob].',
}
```

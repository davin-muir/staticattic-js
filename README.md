### staticattic-js
A partial replication of the python staticattic, built using JavaScript & Pulumi.

### Setup
##### AWS
Install & congigure the aws cli.
###### Linux
```linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
```
###### Windows
```Windows
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```
##### Initialize the project
```Node
npm init
```
##### Install the pulumi package with npm
```Node
npm install @pulumi/aws
```
##### Run the index file
```Node
node index.js
```

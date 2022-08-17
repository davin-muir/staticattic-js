const auto = require('@pulumi/pulumi/automation')
const aws = require('@pulumi/aws')
const process = require('process')


const arg = process.argv.slice(2);
let destroy = false;
if (arg.length > 0 && arg[0]) {
    // If the arguement passed in is 'destroy', set destroy to True
    destroy = arg[0] === 'destroy';
}

const run = async () => {
    const pulumiProgram = async () => {
        //Create a storage bucket and specify the index document.
        const siteBucket = new aws.s3.BucketObject(
            's3-website-bucket',
            {
                website: {
                    indexDocument: 'index.html',
                },
            }
        );
        
    
        /*
        In the python version I pulled this HTML content from the frontend,
        here I'll just pass it in since this is a JS replication of the server.
        */
        const indexContent = `
            <html>
                <head>
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <img class='thumbnail'>
                    <h2>A Developer's Dilema</h2>
                    <button>Watch now</button>
                </body>
            <html>
        `

        //Add the index file to the bucket
        let object = new aws.s3.BucketObject(
            'index',
            {
                bucket: siteBucket,
                content: indexContent,
                contentType: 'text/html; charset=utf-8',
                key: 'index.html'
            }
        );

        function publicReadPolicyForBucket(bucketName) {
            return {
                Version: '2012-10-17',
                Statement: [{
                    Effect: 'Allow',
                    Principal: '*',
                    Action: [
                        's3:GetObject'
                    ],
                    Resouce: [
                        //Explicitly refer to the current bucket.
                        `arn:aws:s3:::${bucketName}/*`
                    ]
                }]
            };
        }

        new aws.s3.BucketPolicy(
            'bucketPolicy',
            {
                bucket: siteBucket.bucket,
                policy: siteBucket.apply(publicReadPolicyForBucket)
            }
        );

        return {
            websiteUrl: siteBucket.websiteEndpoint,
        };

    };


    const args = {
        stackName: 'dev',
        projectName: 'inlineNode',
        program: pulumiProgram
    };
    
    
    //create the stack or select an existion one
    const stack = await auto.LocalWorkspace.createOrSelectStack(args);
    await stack.workspace.installPlugin('aws', 'v4.0.0');
    await stack.setConfig('aws:region', {value: 'us-east-1'});
    await stack.refresh({ onOutput: console.info })
    
    if (destroy) {
        await stack.destroy({ onOutput: console.info })
        console.info('You\'ve destroyed the stack.')
        process.exit(0);
    }
    
    console.info('Updating the stack..')
    const upRes = await stack.up({ onOutput: console.info });
    console.info(`Update summary: \n${JSON.stringify(upRes.summary.resourceChanges, null, 4)}`)
    console.info(`Website url: ${upRes.outputs.websiteUrl.value}`);
};
run().catch(err => console.log(err))
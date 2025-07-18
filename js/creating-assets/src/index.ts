import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createGenericFile, generateSigner, keypairIdentity, sol } from "@metaplex-foundation/umi";
import fs from 'fs';

async function main() {
    // Create Umi instance
    const umi = createUmi('https://api.devnet.solana.com')
        .use(irysUploader())
        .use(mplCore());

    const keypair = generateSigner(umi);
    umi.use(keypairIdentity(keypair));
    await umi.rpc.airdrop(keypair.publicKey, sol(1));

    // Load the image to a GenericFile
    const imageFile = createGenericFile(fs.readFileSync('test.png'), 'test.png', { contentType: 'image/png' });

    // Upload the image to Irys
    const [imageUri] = await umi.uploader.upload([imageFile])

    // Upload the JSON to Irys
    const uri = await umi.uploader.uploadJson({
        name: "Numbers #0",
        image: imageUri,
        properties: {
            files: [
                {
                    uri: imageUri,
                    type: "image/png"
                }
            ],
            category: "image",
            creators: [
                {
                    address: "4xbJp9sjeTEhheUDg8M1nJUomZcGmFZsjt9Gg3RQZAWp",
                    share: 100
                }
            ]
        },
        description: "A set of test NFTs for the Solana blockchain",
        seller_fee_basis_points: 500,
        attributes: [
            {
                trait_type: "Number",
                value: "0"
            }
        ]
    });

    const asset = generateSigner(umi);
    await create(umi, {
        asset,
        name: "Numbers #0",
        uri,
    }).sendAndConfirm(umi);

    console.log(`https://core.metaplex.com/explorer/${asset.publicKey.toString()}?env=devnet`);
}

main().then(() => {
    process.exit(0);
});
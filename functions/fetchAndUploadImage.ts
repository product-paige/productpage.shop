import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image_url } = await req.json();

        if (!image_url) {
            return Response.json({ error: 'Image URL is required' }, { status: 400 });
        }

        console.log(`Fetching image from: ${image_url}`);
        
        // Fetch the image from the external URL with User-Agent header
        const imageResponse = await fetch(image_url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': new URL(image_url).origin
            }
        });
        
        if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error(`Fetch failed - Status: ${imageResponse.status}, Body: ${errorText.substring(0, 500)}`);
            return Response.json({ 
                error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` 
            }, { status: 500 });
        }

        const blob = await imageResponse.blob();
        console.log(`Fetched blob - Type: ${blob.type}, Size: ${blob.size} bytes`);
        
        // Extract file extension from URL
        const urlParts = image_url.split('.');
        const fileExtension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : 'jpg';
        const fileName = `product-${Date.now()}.${fileExtension}`;
        
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });

        // Upload to Base44 storage
        console.log(`Uploading to Base44...`);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        console.log(`Upload successful: ${file_url}`);

        return Response.json({ file_url });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
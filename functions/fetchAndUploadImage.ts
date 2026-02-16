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
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
            // Fetch the image from the external URL with User-Agent header
            const imageResponse = await fetch(image_url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': new URL(image_url).origin
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!imageResponse.ok) {
                console.error(`Fetch failed - Status: ${imageResponse.status}`);
                return Response.json({ 
                    error: `Failed to fetch image: ${imageResponse.status}` 
                }, { status: 500 });
            }

            const blob = await imageResponse.blob();
            console.log(`Fetched blob - Size: ${blob.size} bytes`);
            
            // Validate it's actually an image
            if (!blob.type.startsWith('image/')) {
                return Response.json({ 
                    error: 'URL does not point to a valid image' 
                }, { status: 400 });
            }
            
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
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                return Response.json({ error: 'Request timeout' }, { status: 408 });
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
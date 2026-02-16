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

        // Fetch the image from the external URL
        const imageResponse = await fetch(image_url);
        
        if (!imageResponse.ok) {
            return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
        }

        const blob = await imageResponse.blob();
        const file = new File([blob], 'product-image.jpg', { type: blob.type });

        // Upload to Base44 storage
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        return Response.json({ file_url });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
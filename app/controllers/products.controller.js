const Products =require( "../models/products.model");

exports.create = (req, res) => {
    
};

exports.findAll=(req, res)=> {
    const category = req.query.category ? req.query.category : null; 
    const searchFor=req.query.searchFor ? req.query.searchFor : null; 
    console.log(req.query);
    Products.getAll(category,searchFor, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Products."
            });
        else res.status(200).send(data);
    });
}
const Sauce = require('../model/Sauce');
const fs = require('fs')

// Les codes pour chaque routes
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  //delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    usersDisliked: [],
    usersLiked: [],
    dislikes: 0,
    likes:0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => {res.status(201).json({ message: 'Objet enregistré !'})})
    .catch(error => {
      console.error(error.message)
      return res.status(400).json({ error })
    });
};

exports.createLikeSauce = (req, res, next) => {
  const sauceObjectBody = JSON.parse(req.body.like) // Je créer une variable pour traduire la requête like à l'intérieur du body
  const userId = req.body.userId
  const likes = req.body.likes
  const dislikes = req.body.dislikes
  const usersLiked = req.body.usersLiked
  const usersDisliked = req.body.usersLiked
  
  Sauce.findOne({id: req.params.id}, {userId, _id: req.params.id})// Je compare l'Id qui a déjà liker pourqu'ils ne puissent pas liker/disliker deux fois
  // Ici je crée une promise, si like, dislike et 0 (annuler like et dislike) et fait et il n'y a pas de problème alors  on les pousse au front end, si ca ne fonctionne pas on catch l'erreur 400
  .then(() => {
      switch (sauceObjectBody) {
        case 1:
          Sauce.updateOne({ _id: req.params.id },
            {$push:{usersLiked: userId}, $inc:{likes: 1}}
            )
              .then(() => res.status(201).json({ message: 'Objet aimée !'}))    
              .catch(error => {
                  console.error(error.message)
                  return res.status(400).json({error})
                })    
          break;  
        case -1:
          Sauce.updateOne({ _id: req.params.id },
            {$push:{usersDisliked: userId}, $inc:{dislikes: 1}}
            )
              .then(() => res.status(201).json({ message: 'Objet détestée !'}))
              .catch(error => {
                  console.error(error.message)
                  return res.status(400).json({error})
                })
          break;
        case 0 :
         Sauce.updateOne({ _id: req.params.id },
            {$push:{usersLiked: userId}, $inc:{likes: 0}},
            {$push:{usersDisliked: userId}, $inc:{dislikes: 0}})
              .then(() => res.status(201).json({ message: 'Objet aimée !'}))    
              .catch(error => {
                  console.error(error.message)
                  return res.status(400).json({error})
                })    
          break;
          default:
            throw new Exception('Imposisble, vous ne pouvez pas aimer et ne pas aimer en même temps !')
      }
    })
    .catch(error => {
      console.error(error.message)
      return res.status(400).json({error})
    })
  }

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {res.status(200).json(sauce)})
  .catch((error) => {res.status(404).json({error})})
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : {...req.body}
  Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
    .then(() => {res.status(200).json({message: 'Objet modifié !'})})    
    .catch((error) => {res.status(400).json({error});});
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then((sauces) => {res.status(200).json(sauces)})
  .catch((error) => {res.status(400).json({error})}
  );
};